import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Layout, Card, Alert, Input, Button, Typography, 
    Spin, Row, Col, Modal, message, Space 
} from 'antd';
import { CloseOutlined, ArrowLeftOutlined, LoginOutlined } from '@ant-design/icons';

import { useQuizRoomSocket } from '@/features/quiz/hooks/useQuizRoomSocket';
import { quizService } from '@/features/quiz/api/quizService';
import { QuizRoomStatus } from '@/features/quiz/model/types';
import { useAuth } from '@/features/auth/AuthContext';

import { QuizLobby } from '@/features/quiz/components/live/QuizLobby';
import { QuizGameView } from '@/features/quiz/components/live/QuizGameView';
import { QuizResultView } from '@/features/quiz/components/live/QuizResultView';
import { InviteUsersPanel } from '@/features/quiz/components/live/InviteUserPanel';

const { Content } = Layout;
const { Title, Text } = Typography;

const QuizRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth(); 
    const [messageApi, contextHolder] = message.useMessage();
    
    const [isJoined, setIsJoined] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [nickname, setNickname] = useState('');
    
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [isLoadingCheck, setIsLoadingCheck] = useState(true);

    const { status, currentQuestion, leaderboard, finalResults } = useQuizRoomSocket(roomId || '');

    useEffect(() => {
        if (!roomId) return;

        const initRoom = async () => {
            try {
                const details = await quizService.getRoomDetails(roomId);
                
                if (currentUser && details.hostId === currentUser.id) {
                    await quizService.joinRoom(roomId, "HOST"); 
                    setIsHost(true);
                    setIsJoined(true);
                }
                else if (details.participant){
                    setIsJoined(true);
                }
            } catch (e) {
                console.error(e);
                setJoinError("Failed to load room.");
            } finally {
                setIsLoadingCheck(false);
            }
        };

        initRoom();
    }, [roomId, currentUser]);

    const handleJoin = async () => {
        if (!nickname) return;
        const ticket = searchParams.get('ticket'); 

        setIsJoining(true);
        setJoinError(null);
        try {
            const res = await quizService.joinRoom(roomId!, nickname, ticket);
            setIsHost(res.host); 
            setIsJoined(true);
        } catch (e: any) {
            console.error(e);
            setJoinError("Failed to join. Check nickname or invitation.");
        } finally {
            setIsJoining(false);
        }
    };

    const handleStartGame = async () => {
        if (!roomId) return;
        Modal.confirm({
            title: "Start Quiz?",
            content: "Are you sure you want to start the game?",
            onOk: async () => {
                await quizService.startQuiz(roomId);
            }
        });
    };

    const handleCloseRoom = async () => {
        if (!roomId) return;
        Modal.confirm({
            title: "End Session?",
            content: "Are you sure you want to close the room for everyone?",
            okType: 'danger',
            onOk: async () => {
                await quizService.closeRoom(roomId);
            }
        });
    };

    const handleFinishQuestionManually = async () => {
        if (!roomId) return;
        await quizService.finishQuestionManually(roomId);
    };
    
    const handleNextQuestion = async () => {
        if (!roomId) return;
        await quizService.nextQuestion(roomId);
    };

    const handleSubmitAnswer = async (optionId: number) => {
        if (!roomId || !currentQuestion) return;
        await quizService.submitAnswer(roomId, currentQuestion.questionId, optionId);
    };

    if (!roomId) return <Alert message="Error" description="Missing Room ID" type="error" showIcon />;
    if (isLoadingCheck) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;

    if (!isJoined) {
        return (
            <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={3}>Join Quiz</Title>
                        <Text type="secondary">Enter your nickname to join the leaderboard.</Text>
                    </div>
                    
                    <Input 
                        placeholder="Your Nickname" 
                        size="large"
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        status={joinError ? 'error' : ''}
                        disabled={isJoining}
                        autoFocus
                        onPressEnter={handleJoin}
                        style={{ marginBottom: 8 }}
                    />
                    
                    {joinError && <Alert message={joinError} type="error" showIcon style={{ marginBottom: 16 }} />}

                    <Button 
                        type="primary" 
                        size="large" 
                        block 
                        onClick={handleJoin}
                        loading={isJoining}
                        disabled={!nickname}
                        icon={<LoginOutlined />}
                    >
                        JOIN GAME
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {contextHolder}
            <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

                {isHost && status !== QuizRoomStatus.FINISHED && (
                    <Alert
                        message={<Text strong>👑 Host Panel</Text>}
                        description="You are controlling this session."
                        type="warning"
                        showIcon
                        action={
                            <Button size="small" danger onClick={handleCloseRoom} icon={<CloseOutlined />}>
                                End Session
                            </Button>
                        }
                        style={{ marginBottom: 24 }}
                    />
                )}

                {status === QuizRoomStatus.LOBBY && (
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={isHost ? 16 : 24}>
                            <QuizLobby 
                                isHost={isHost} 
                                roomId={roomId}
                                participants={leaderboard || []} 
                                onStart={handleStartGame} 
                            />
                        </Col>

                        {isHost && (
                            <Col xs={24} md={8}>
                                <InviteUsersPanel roomId={roomId} />
                            </Col>
                        )}
                    </Row>
                )}

                {status === QuizRoomStatus.QUESTION_ACTIVE && currentQuestion && (
                    <QuizGameView 
                        question={currentQuestion as any} 
                        isHost={isHost}
                        onSubmitAnswer={handleSubmitAnswer}
                        onFinishEarly={handleFinishQuestionManually}
                    />
                )}

                {(status === QuizRoomStatus.QUESTION_FINISHED) && (
                    <QuizResultView 
                        status={status}
                        isHost={isHost}
                        leaderboard={leaderboard || []}
                        onNext={handleNextQuestion}
                        onClose={handleCloseRoom}
                    />
                )}

                {status === QuizRoomStatus.FINISHED && (
                    <div>
                        <QuizResultView 
                            status={status}
                            isHost={isHost}
                            leaderboard={finalResults?.leaderboard || leaderboard || []}
                            onNext={() => {}}
                            onClose={() => {}} 
                        />

                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <Button 
                                type={isHost ? "primary" : "default"}
                                size="large" 
                                onClick={() => navigate('/quiz')}
                                icon={<ArrowLeftOutlined />}
                            >
                                {isHost ? "Back to Dashboard" : "Leave Game"}
                            </Button>
                        </div>
                    </div>
                )}

            </Content>
        </Layout>
    );
};

export default QuizRoomPage;