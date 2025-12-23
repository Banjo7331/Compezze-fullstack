import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Layout, Typography, Alert, Spin, Button, 
    Card, Row, Col, Result, Divider 
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

import { surveyService } from '@/features/survey/api/surveyService';
import { SurveySubmissionForm } from '@/features/survey/components/live/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/live/LiveResultSurveyDashboard';
import { RoomControlPanel } from '@/features/survey/components/live/RoomControlPanel';
import { InviteUsersPanel } from '@/features/survey/components/live/InviteUserPanel';

import type { SurveyFormStructure } from '@/features/survey/model/types';

const { Content } = Layout;
const { Title, Text } = Typography;

const SurveyRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [loadingState, setLoadingState] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const [isHost, setIsHost] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [surveyForm, setSurveyForm] = useState<SurveyFormStructure | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const enterRoom = async () => {
            setLoadingState('LOADING');
            try {
                const response = await surveyService.joinRoom(roomId);
                
                setSurveyForm(response.survey);
                setIsHost(response.host);
                setIsSubmitted(response.hasSubmitted);
                
                setLoadingState('READY');

            } catch (error: any) {
                console.error("Failed to enter room:", error);
                setErrorMsg(error.message || "Could not access the room.");
                setLoadingState('ERROR');
            }
        };

        enterRoom();
    }, [roomId]);

    const handleSubmissionSuccess = () => setIsSubmitted(true);
    const handleSubmissionFailure = () => alert("Submission failed. Try again.");
    
    const handleRoomClosed = () => {
        console.log("Room closed.");
    };

    if (!roomId) return <div style={{ padding: 24 }}><Alert message="Error" description="Missing Room ID" type="error" showIcon /></div>;

    if (loadingState === 'LOADING') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
                <Spin size="large" tip="Entering Room..." />
            </div>
        );
    }

    if (loadingState === 'ERROR') {
        return (
            <div style={{ maxWidth: 600, margin: '100px auto', padding: 24 }}>
                <Result
                    status="error"
                    title="Access Denied"
                    subTitle={errorMsg}
                    extra={[
                        <Button type="primary" key="back" onClick={() => navigate('/survey')}>
                            Back to Survey Center
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                
                {isHost && (
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <RoomControlPanel roomId={roomId} onCloseSuccess={handleRoomClosed} />
                                <InviteUsersPanel roomId={roomId} />
                                
                                <div style={{ textAlign: 'center' }}>
                                    <Button onClick={() => navigate('/survey')} icon={<ArrowLeftOutlined />}>
                                        Back to My Surveys
                                    </Button>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={16}>
                            <Card title={<Title level={4} style={{ margin: 0 }}>Host Dashboard</Title>}>
                                <LiveResultSurveyDashboard roomId={roomId} isHost={true} />
                            </Card>
                        </Col>
                    </Row>
                )}


                {!isHost && (
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        {isSubmitted ? (
                            <Card>
                                <Result
                                    status="success"
                                    title="Survey Completed!"
                                    subTitle="Thank you for your participation. You can watch the live results below."
                                />
                                <Divider />
                                <LiveResultSurveyDashboard 
                                    roomId={roomId} 
                                    isHost={false} 
                                    isParticipantSubmitted={true} 
                                />
                            </Card>
                        ) : (
                            surveyForm ? (
                                <SurveySubmissionForm
                                    roomId={roomId}
                                    surveyForm={surveyForm}
                                    onSubmissionSuccess={handleSubmissionSuccess}
                                    onSubmissionFailure={handleSubmissionFailure}
                                />
                            ) : (
                                <Alert message="Warning" description="Loading form data failed." type="warning" showIcon />
                            )
                        )}
                    </div>
                )}

            </Content>
        </Layout>
    );
};

export default SurveyRoomPage;