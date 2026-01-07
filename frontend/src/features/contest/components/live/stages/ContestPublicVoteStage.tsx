import React, { useState, useEffect } from 'react';
import { 
    Typography, Row, Col, Card, Modal, Button, 
    Spin, Alert, Tag, Space, Image 
} from 'antd';
import { 
    CheckCircleOutlined, 
    ZoomInOutlined, 
    LikeOutlined,
    PlayCircleOutlined 
} from '@ant-design/icons';

import { contestService } from '@/features/contest/api/contestService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { SubmissionDto, StageSettingsResponse } from '@/features/contest/model/types';

const { Title, Text, Paragraph } = Typography;

interface Props {
    contestId: string;
    roomId: string;
    settings: StageSettingsResponse;
}

const shuffleArray = (array: SubmissionDto[]) => {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
};

export const ContestPublicVoteStage: React.FC<Props> = ({ contestId, roomId, settings }) => {
    const { showSuccess, showError } = useSnackbar();
    
    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedSub, setSelectedSub] = useState<SubmissionDto | null>(null);
    
    const [votedSubId, setVotedSubId] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const list: any = await contestService.getSubmissionsForReview(contestId, 'APPROVED');
                const rawData = Array.isArray(list) ? list : list.content;
                setSubmissions(shuffleArray(rawData || []));
            } catch (e) {
                console.error("Error fetching submissions", e);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [contestId]);

    const handleVote = async () => {
        if (!selectedSub) return;
        setIsVoting(true);
        try {
            await contestService.vote(contestId, roomId, settings.stageId, selectedSub.id, 1);
            showSuccess(`Your vote for "${selectedSub.participantName}" has been accepted!`);
            setVotedSubId(selectedSub.id);
            setSelectedSub(null);
        } catch (e: any) {
            if (e.response?.status === 409 || e.message?.includes("already")) {
                showError("You can only vote once!");
            } else {
                showError("An error occurred while voting.");
            }
        } finally {
            setIsVoting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}><Spin size="large" /></div>;

    return (
        <div>
            {/* --- NAGŁÓWEK --- */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
                    Audience Voting
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 16 }}>
                    Click on a card to view the submission details and cast your vote.<br/>
                    You have only <strong>ONE</strong> vote!
                </Paragraph>
                
                {votedSubId && (
                    <Alert 
                        message="Thank you! Your vote has been recorded." 
                        type="success" 
                        showIcon 
                        icon={<CheckCircleOutlined />}
                        style={{ display: 'inline-flex', marginTop: 16 }}
                    />
                )}
            </div>

            {/* --- LISTA ZGŁOSZEŃ --- */}
            <Row gutter={[16, 16]}>
                {submissions.map((sub) => {
                    const isSelected = votedSubId === sub.id;
                    const isOther = votedSubId && !isSelected;
                    // Sprawdzamy czy to wideo
                    const isVideo = sub.mediaUrl?.includes('.mp4') || sub.mediaUrl?.includes('.webm');

                    return (
                        <Col xs={12} sm={8} md={6} key={sub.id}>
                            <Card 
                                hoverable={!votedSubId}
                                onClick={() => !votedSubId && setSelectedSub(sub)}
                                style={{ 
                                    height: '100%', 
                                    opacity: isOther ? 0.5 : 1,
                                    borderColor: isSelected ? '#52c41a' : undefined,
                                    borderWidth: isSelected ? 2 : 1,
                                    overflow: 'hidden'
                                }}
                                bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                {/* KONTENER MEDIÓW */}
                                <div style={{ 
                                    width: '100%', height: 160, 
                                    backgroundColor: '#000', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#bdbdbd',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {sub.mediaUrl ? (
                                        isVideo ? (
                                            // RENDEROWANIE WIDEO W MINIATURCE
                                            <>
                                                <video 
                                                    src={sub.mediaUrl} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    muted // Wyciszamy miniaturkę
                                                    preload="metadata"
                                                />
                                                {/* Ikona Play na środku dla jasności */}
                                                <div style={{
                                                    position: 'absolute', top: '50%', left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    color: 'rgba(255,255,255,0.8)', fontSize: 32
                                                }}>
                                                    <PlayCircleOutlined />
                                                </div>
                                            </>
                                        ) : (
                                            // RENDEROWANIE OBRAZKA
                                            <img 
                                                src={sub.mediaUrl} 
                                                alt="Thumbnail" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        )
                                    ) : (
                                        // BRAK PLIKU
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <ZoomInOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                                            <Text type="secondary" style={{ fontSize: 12, color: '#888' }}>No Preview</Text>
                                        </div>
                                    )}
                                </div>
                                
                                {/* TREŚĆ KARTY */}
                                <div style={{ padding: 12, flexGrow: 1 }}>
                                    <Text strong style={{ display: 'block' }} ellipsis>
                                        {sub.participantName}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                                        {sub.originalFilename || "Untitled"}
                                    </Text>
                                    
                                    {isSelected && (
                                        <div style={{ marginTop: 8 }}>
                                            <Tag color="success" icon={<CheckCircleOutlined />}>Your Vote</Tag>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* --- MODAL PODGLĄDU I GŁOSOWANIA --- */}
            <Modal 
                open={!!selectedSub} 
                onCancel={() => setSelectedSub(null)}
                title={<span style={{ fontWeight: 'bold' }}>{selectedSub?.participantName}</span>}
                width={800}
                centered
                footer={[
                    <Button key="back" onClick={() => setSelectedSub(null)}>
                        Back
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        icon={<LikeOutlined />} 
                        onClick={handleVote} 
                        loading={isVoting}
                        size="large"
                        style={{ minWidth: 120 }}
                    >
                        CAST VOTE
                    </Button>
                ]}
            >
                {selectedSub && (
                    <>
                        <div style={{ 
                            width: '100%', minHeight: 400, backgroundColor: '#000', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16, borderRadius: 8, overflow: 'hidden'
                        }}>
                            {selectedSub.mediaUrl ? (
                                (selectedSub.mediaUrl.includes('.mp4') || selectedSub.mediaUrl.includes('.webm')) ? (
                                    <video 
                                        controls 
                                        autoPlay 
                                        style={{ maxHeight: '60vh', maxWidth: '100%' }} 
                                        src={selectedSub.mediaUrl} 
                                    />
                                ) : (
                                    <Image 
                                        src={selectedSub.mediaUrl} 
                                        alt="Submission" 
                                        style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} 
                                        preview={false} // Wyłączamy preview Image, bo jesteśmy już w modalu
                                    />
                                )
                            ) : (
                                <Text type="danger">No file available</Text>
                            )}
                        </div>
                        
                        <div style={{ padding: '0 8px' }}>
                            <Title level={5}>Description:</Title>
                            <Paragraph style={{ fontSize: 16 }}>
                                {selectedSub.comment || "No description provided by the participant."}
                            </Paragraph>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};