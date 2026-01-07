import React, { useState, useEffect } from 'react';
import { 
    Typography, Row, Col, Card, Button, 
    Slider, Space, Alert, Spin 
} from 'antd';
import { 
    SafetyCertificateOutlined, 
    FormOutlined, 
    PlayCircleOutlined 
} from '@ant-design/icons';

import { contestService } from '@/features/contest/api/contestService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { SubmissionDto, StageSettingsResponse } from '@/features/contest/model/types';

const { Title, Text, Paragraph } = Typography;

interface Props {
    contestId: string;
    roomId: string;
    settings: StageSettingsResponse & { type: 'JURY_VOTE' };
    isOrganizer: boolean;
    isJury: boolean;
}

export const ContestJuryStage: React.FC<Props> = ({ contestId, roomId, settings, isOrganizer, isJury }) => {
    const { showSuccess, showError } = useSnackbar();
    
    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    const [currentSubIndex, setCurrentSubIndex] = useState(0); 
    const [score, setScore] = useState<number>(settings.maxScore / 2);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const list: any = await contestService.getSubmissionsForReview(contestId, 'APPROVED');
                const data = Array.isArray(list) ? list : list.content;
                setSubmissions(data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, [contestId]);

    const currentSubmission = submissions[currentSubIndex];

    const handleVote = async () => {
        if (!currentSubmission) return;
        try {
            await contestService.vote(contestId, roomId, settings.stageId, currentSubmission.id, score);
            showSuccess(`Vote submitted: ${score}`);
            setHasVoted(true);
        } catch (e) {
            showError("Voting error (you might have already voted).");
        }
    };

    const handleNextSubmission = () => {
        if (currentSubIndex < submissions.length - 1) {
            setCurrentSubIndex(prev => prev + 1);
            setHasVoted(false);
            setScore(settings.maxScore / 2);
        }
    };

    const handlePrevSubmission = () => {
        if (currentSubIndex > 0) {
            setCurrentSubIndex(prev => prev - 1);
            setHasVoted(false);
        }
    };

    if (submissions.length === 0) {
        return <Alert message="Info" description="No approved submissions to grade." type="info" showIcon />;
    }

    if (!currentSubmission) return <div style={{ textAlign: 'center', marginTop: 40 }}><Spin size="large" /></div>;

    const mediaUrl = currentSubmission.mediaUrl;
    const isVideo = mediaUrl?.includes('.mp4');

    return (
        <div>
            {/* Header */}
            <Card 
                style={{ marginBottom: 24, backgroundColor: '#fff7e6', borderColor: '#ffd591' }}
                bodyStyle={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}
            >
                <SafetyCertificateOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
                <div style={{ flexGrow: 1 }}>
                    <Title level={4} style={{ margin: 0 }}>Jury Voting</Title>
                    <Text type="secondary">
                        Grading submission {currentSubIndex + 1} of {submissions.length}
                    </Text>
                </div>
                {isOrganizer && (
                    <Space>
                        <Button onClick={handlePrevSubmission} disabled={currentSubIndex === 0}>
                            Previous
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={handleNextSubmission} 
                            disabled={currentSubIndex === submissions.length - 1} 
                            icon={<PlayCircleOutlined />}
                        >
                            Next Submission
                        </Button>
                    </Space>
                )}
            </Card>

            <Row gutter={[24, 24]}>
                {/* Media Column */}
                <Col xs={24} md={14}>
                    <Card hoverable bodyStyle={{ padding: 0 }}>
                        <div style={{ 
                            height: 400, 
                            backgroundColor: 'black', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8
                        }}>
                            {mediaUrl ? (
                                isVideo ? (
                                    <video controls autoPlay style={{ height: '100%', width: '100%', objectFit: 'contain' }} src={mediaUrl} />
                                ) : (
                                    <img src={mediaUrl} alt="Submission" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                )
                            ) : (
                                <Text type="danger">No file / preview available</Text>
                            )}
                        </div>
                        
                        <div style={{ padding: 24 }}>
                            <Title level={4} style={{ marginBottom: 8 }}>{currentSubmission.participantName}</Title>
                            <Paragraph type="secondary" style={{ margin: 0 }}>
                                {currentSubmission.comment || "No description."}
                            </Paragraph>
                        </div>
                    </Card>
                </Col>

                {/* Voting Column */}
                <Col xs={24} md={10}>
                    {isJury ? (
                        <Card style={{ height: '100%' }} bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Title level={5} style={{ textAlign: 'center', marginBottom: 24 }}>YOUR SCORE</Title>
                            
                            <div style={{ padding: '0 16px', marginBottom: 32 }}>
                                <Slider
                                    value={score}
                                    onChange={(v) => setScore(v)}
                                    step={1}
                                    min={1}
                                    max={settings.maxScore}
                                    marks={{ 1: '1', [settings.maxScore]: `${settings.maxScore}` }}
                                    disabled={hasVoted}
                                    trackStyle={{ backgroundColor: '#fa8c16' }}
                                    handleStyle={{ borderColor: '#fa8c16' }}
                                />
                                <div style={{ textAlign: 'center', marginTop: 8 }}>
                                    <Text strong style={{ fontSize: 24, color: '#fa8c16' }}>{score}</Text> / {settings.maxScore}
                                </div>
                            </div>

                            <Button 
                                type="primary" 
                                size="large"
                                icon={<FormOutlined />}
                                onClick={handleVote}
                                disabled={hasVoted}
                                block
                                style={{ height: 50, fontSize: 16, backgroundColor: hasVoted ? undefined : '#fa8c16' }}
                            >
                                {hasVoted ? "GRADED" : "SUBMIT SCORE"}
                            </Button>
                            
                            {hasVoted && (
                                <Alert 
                                    message="Vote accepted" 
                                    description="Wait for the next submission." 
                                    type="success" 
                                    showIcon 
                                    style={{ marginTop: 24 }} 
                                />
                            )}
                        </Card>
                    ) : (
                        <Card style={{ height: '100%' }}>
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                <Spin size="large" />
                                <Title level={5} style={{ marginTop: 24 }}>The Jury is grading...</Title>
                                <Text type="secondary">Please wait for results.</Text>
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
};