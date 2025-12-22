import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Layout, Spin, Alert, Row, Col, Card, Button, 
    Typography, Modal, Space, Tag, message 
} from 'antd';
import { 
    ArrowLeftOutlined, 
    PoweroffOutlined, 
    StepForwardOutlined,
    StopOutlined 
} from '@ant-design/icons';

import { contestService } from '@/features/contest/api/contestService';
import { useContestSocket } from '@/features/contest/hooks/useContestSocket';
import type { GetContestRoomDetailsResponse, ContestDetailsDto } from '@/features/contest/model/types';

import { ContestLobbyView } from '@/features/contest/components/live/ContestLobbyView';
import { ContestStageRenderer } from '@/features/contest/components/live/ContestStageRenderer';
import { ContestLiveChat } from '@/features/contest/components/live/ContestLiveChat';
import { ContestLeaderboard } from '@/features/contest/components/live/ContestLeaderboard';
import { ContestFinishedView } from '@/features/contest/components/live/ContestFinishedView';

import { useAuth } from '@/features/auth/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const getStableIndexFromId = (id: string, max: number) => {
    if (!max || max === 0) return 0;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % max;
};

const ContestLivePage: React.FC = () => {
    const { currentUserId } = useAuth();
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    
    const [messageApi, contextHolder] = message.useMessage();

    const [roomState, setRoomState] = useState<GetContestRoomDetailsResponse | null>(null);
    const [contestInfo, setContestInfo] = useState<ContestDetailsDto | null>(null); 
    const [stageTicket, setStageTicket] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
    const [userAvatarMap, setUserAvatarMap] = useState<Record<string, string>>({});

    const isFinished = contestInfo?.status === 'FINISHED';

    useEffect(() => {
        const loadAvatars = async () => {
            try {
                const urls = await contestService.getAvatars();
                setAvailableAvatars(urls);
            } catch (e) {
                console.error("Failed to load avatars", e);
            }
        };
        loadAvatars();
    }, []);

    const fetchState = useCallback(async () => {
        try {
            const roomData = await contestService.getRoomDetails(contestId!);
            setRoomState(roomData);
            
            const infoData = await contestService.getContestDetails(contestId!);
            setContestInfo(infoData);

            const settings = roomData.currentStageSettings;
            if (settings && (settings.type === 'QUIZ' || settings.type === 'SURVEY') && settings.activeRoomId) {
                try {
                    const token = await contestService.getStageAccessToken(contestId!, roomData.roomId);
                    setStageTicket(token);
                } catch (e) {
                    setStageTicket(null);
                }
            } else {
                setStageTicket(null);
            }
        } catch (e) {
            console.error(e);
            messageApi.error("Failed to fetch session state.");
        } finally {
            setIsLoading(false);
        }
    }, [contestId, messageApi]);

    useEffect(() => {
        if (contestId) fetchState();
    }, [contestId, fetchState]);

    useContestSocket({ 
        contestId, 
        onRefresh: () => {
            console.log("🔄 Stage/State change signal received!");
            setIsTransitioning(true);
            fetchState().then(() => {
                setIsTransitioning(false);
            });
        }
    });

    useEffect(() => {
        const currentLeaderboard = roomState?.leaderboard;
        if (!currentLeaderboard || availableAvatars.length === 0) return;

        setUserAvatarMap(prevMap => {
            const newMap = { ...prevMap };
            let hasChanges = false;

            currentLeaderboard.forEach(entry => {
                if (!newMap[entry.userId]) {
                    const idx = getStableIndexFromId(entry.userId, availableAvatars.length);
                    newMap[entry.userId] = availableAvatars[idx];
                    hasChanges = true;
                }
            });

            return hasChanges ? newMap : prevMap;
        });
    }, [roomState?.leaderboard, availableAvatars]);

    const leaderboardWithAvatars = useMemo(() => {
        if (!roomState?.leaderboard) return [];
        return roomState.leaderboard.map(entry => ({
            ...entry,
            avatarUrl: userAvatarMap[entry.userId]
        }));
    }, [roomState?.leaderboard, userAvatarMap]);


    const handleStartContest = async () => {
        if (!roomState?.roomId) return;
        try {
            await contestService.startContest(contestId!, roomState.roomId);
            messageApi.success("Contest started!");
            fetchState(); 
        } catch (e) { messageApi.error("Start failed."); }
    };

    const handleNextStage = async () => {
        if (!roomState?.roomId) return;
        Modal.confirm({
            title: 'Move to next stage?',
            content: 'Are you sure you want to proceed?',
            onOk: async () => {
                try {
                    await contestService.nextStage(contestId!, roomState.roomId);
                    messageApi.success("Stage changed.");
                    fetchState(); 
                } catch (e) { messageApi.error("Stage change failed."); }
            }
        });
    };

    const handleCloseContest = async () => {
        if (!roomState?.roomId) return;
        Modal.confirm({
            title: 'Close entire contest?',
            content: 'This will close the session for everyone. Are you sure?',
            okType: 'danger',
            onOk: async () => {
                try {
                    await contestService.closeContest(contestId!, roomState.roomId);
                    messageApi.success("Contest closed.");
                    navigate(`/contest/${contestId}`);
                } catch (e) { 
                    messageApi.error("Closing failed."); 
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading session..." />
            </div>
        );
    }

    if (!roomState) {
        return (
            <div style={{ padding: 40 }}>
                <Alert message="Session Error" description="Could not load session details." type="error" showIcon />
            </div>
        );
    }

    if (isTransitioning) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
                <Spin size="large" />
                <Title level={4} style={{ marginTop: 20 }}>Updating Stage...</Title>
            </div>
        );
    }

    const isOrganizer = contestInfo?.organizer || false;
    const isJury = contestInfo?.myRoles?.includes('JURY') || false;
    const isLobby = roomState.currentStagePosition === 0;

    if (isFinished) {
        return (
            <ContestFinishedView 
                leaderboard={roomState?.leaderboard || []} 
                currentUserId={currentUserId}
                contestId={contestId!}
            />
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {contextHolder}
            
            <Content style={{ padding: '16px', width: '100%', margin: 0 }}>
                
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/contest/${contestId}`)}>
                        Exit Live View
                    </Button>
                    {!isLobby && (
                        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 10px' }}>
                            STAGE {roomState.currentStagePosition}
                        </Tag>
                    )}
                </div>

                <Row gutter={[12, 12]}>
                    
                    <Col xs={24} md={6} lg={6} xl={5} xxl={4}>
                         <div style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                            <ContestLeaderboard 
                                leaderboard={leaderboardWithAvatars} 
                                currentUserId={currentUserId} 
                            />
                        </div>
                    </Col>

                    <Col xs={24} md={12} lg={12} xl={14} xxl={16}>
                        {isLobby ? (
                            <ContestLobbyView isOrganizer={isOrganizer} onStart={handleStartContest} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Card 
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
                                >
                                    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                                        {roomState.currentStageSettings ? (
                                            <ContestStageRenderer 
                                                roomId={roomState.roomId}
                                                settings={roomState.currentStageSettings}
                                                isOrganizer={isOrganizer}
                                                ticket={stageTicket}
                                                contestId={contestId!}
                                                isJury={isJury}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <Title level={3} type="secondary">Break / Results Calculation</Title>
                                            </div>
                                        )}
                                    </div>

                                    {isOrganizer && (
                                        <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px', background: '#fafafa' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text strong>Organizer Panel</Text>
                                                <Space>
                                                    <Button type="primary" onClick={handleNextStage} icon={<StepForwardOutlined />}>
                                                        Next Stage
                                                    </Button>
                                                    <Button danger onClick={handleCloseContest} icon={<StopOutlined />}>
                                                        Stop Contest
                                                    </Button>
                                                </Space>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}
                    </Col>

                    <Col xs={24} md={6} lg={6} xl={5} xxl={4}>
                         <div style={{ height: 'calc(100vh - 100px)' }}>
                             {contestId && <ContestLiveChat contestId={contestId} />}
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default ContestLivePage;