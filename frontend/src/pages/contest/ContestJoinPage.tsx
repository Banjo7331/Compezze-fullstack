import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, Card, Typography, Avatar, Space, Divider, Tag } from 'antd';
import { 
    LoginOutlined, 
    TrophyOutlined, 
    TeamOutlined, 
    CalendarOutlined,
    EnvironmentOutlined 
} from '@ant-design/icons';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestDetailsDto } from '@/features/contest/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

const { Title, Text, Paragraph } = Typography;

const ContestJoinPage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();
    
    const [contestInfo, setContestInfo] = useState<ContestDetailsDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            if (!contestId) return;
            try {
                const data = await contestService.getContestDetails(contestId);
                setContestInfo(data);
            } catch (e) {
                console.error(e);
                setError("Could not load contest details. The invitation link might be invalid.");
            } finally {
                setIsLoadingInfo(false);
            }
        };

        fetchInfo();
    }, [contestId]);

    const handleJoinClick = async () => {
        if (!contestId) return;
        
        setIsJoining(true);
        const ticket = searchParams.get('ticket');

        try {
            await contestService.joinContest(contestId, ticket);
            
            showSuccess(`You have joined "${contestInfo?.name}"!`);
            navigate(`/contest/${contestId}`, { replace: true });

        } catch (e: any) {
            console.error("Join error:", e);
            
            if (e.response?.status === 409) {
                showSuccess("You are already a participant of this contest.");
                navigate(`/contest/${contestId}`, { replace: true });
                return;
            }

            const errorMsg = e.response?.data?.detail || "Failed to join via invitation.";
            showError(errorMsg);
        } finally {
            setIsJoining(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString();
    };

    if (isLoadingInfo) {
        return (
            <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
                <Spin size="large" />
                <Text type="secondary">Loading invitation details...</Text>
            </div>
        );
    }

    if (error || !contestInfo) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100, padding: 20 }}>
                <Card style={{ maxWidth: 500, width: '100%' }}>
                    <Result
                        status="error"
                        title="Invitation Error"
                        subTitle={error || "Contest not found."}
                        extra={
                            <Button onClick={() => navigate('/contest')}>Back to List</Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 24,
            background: '#f0f2f5' 
        }}>
            <Card 
                style={{ maxWidth: 480, width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 12 }}
                bodyStyle={{ padding: 32, textAlign: 'center' }}
            >
                {contestInfo.coverUrl ? (
                    <img 
                        src={contestInfo.coverUrl} 
                        alt="Cover" 
                        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 24 }} 
                    />
                ) : (
                    <Avatar 
                        size={64} 
                        icon={<TrophyOutlined />} 
                        style={{ backgroundColor: '#1890ff', marginBottom: 24 }} 
                    />
                )}
                
                <Title level={3} style={{ marginBottom: 8 }}>
                    You've been invited!
                </Title>
                
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    You are about to join the following contest:
                </Text>

                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                        {contestInfo.name}
                    </Title>

                    <Tag color="blue" style={{ marginBottom: 12 }}>
                        {contestInfo.category}
                    </Tag>

                    {contestInfo.description && (
                         <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
                            {contestInfo.description}
                         </Paragraph>
                    )}
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <Space>
                            <TeamOutlined style={{ color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Participants: {contestInfo.currentParticipantsCount}
                                {contestInfo.participantLimit > 0 ? ` / ${contestInfo.participantLimit}` : ''}
                            </Text>
                        </Space>

                        {contestInfo.location && (
                            <Space>
                                <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {contestInfo.location}
                                </Text>
                            </Space>
                        )}

                        <Space>
                            <CalendarOutlined style={{ color: '#8c8c8c' }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {formatDate(contestInfo.startDate)} - {formatDate(contestInfo.endDate)}
                            </Text>
                        </Space>
                    </div>
                </div>

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button 
                        type="primary" 
                        size="large" 
                        block 
                        icon={<LoginOutlined />} 
                        onClick={handleJoinClick}
                        loading={isJoining}
                        disabled={contestInfo.status === 'FINISHED'}
                    >
                        Accept & Join Contest
                    </Button>
                    
                    <Button 
                        type="text" 
                        block 
                        onClick={() => navigate('/contest')}
                        disabled={isJoining}
                    >
                        Cancel
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default ContestJoinPage;