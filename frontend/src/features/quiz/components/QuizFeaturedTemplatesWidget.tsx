import React, { useState, useEffect } from 'react';
import { 
    Card, Typography, Divider, Button, List, Spin, 
    message, Space, Tag 
} from 'antd';
import { 
    ThunderboltOutlined, 
    PlayCircleOutlined, 
    AppstoreOutlined,
    LockOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import type { MyQuizFormDto, CreateQuizRoomRequest } from '../model/types';

import { AllQuizFormsDialog } from './AllQuizFormsDialog';
import { StartQuizRoomDialog } from './StartQuizRoomDialog';

const { Title, Text } = Typography;

export const QuizFeaturedTemplatesWidget: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    
    const [forms, setForms] = useState<MyQuizFormDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isAllFormsDialogOpen, setIsAllFormsDialogOpen] = useState(false);
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const data = await quizService.getMyForms({ page: 0, size: 3, sort: 'createdAt,desc' });
                setForms(data.content);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForms();
    }, []);

    const handleOpenStartDialog = (id: number) => {
        setSelectedFormId(id);
        setStartDialogOpen(true);
    };

    const handleConfirmStart = async (config: { maxParticipants: number }) => {
        if (!selectedFormId) return;

        setIsStarting(true);
        try {
            const request: CreateQuizRoomRequest = {
                quizFormId: selectedFormId,
                maxParticipants: config.maxParticipants,
                isPrivate: false      
            };
            
            const result = await quizService.createRoom(request);
            messageApi.success("Lobby created!");
            navigate(`/quiz/room/${result.roomId}`);
            
        } catch (e) {
            messageApi.error("Failed to create game room.");
            setIsStarting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Card 
                style={{ 
                    height: '100%', 
                    backgroundColor: '#fff7e6', 
                    borderRadius: 12,
                    border: '1px solid #ffd591' 
                }}
                bodyStyle={{ padding: 32 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <ThunderboltOutlined style={{ marginRight: 12, fontSize: 24, color: '#1a9b0eff' }} />
                    <Title level={4} style={{ margin: 0 }}>Quick Play</Title>
                </div>
                
                <Divider style={{ margin: '16px 0 24px 0', borderColor: '#ffec3d' }} />

                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Your recent quizzes:
                </Text>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                ) : forms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                        No quizzes found. Create your first one!
                    </div>
                ) : (
                    <List
                        dataSource={forms}
                        split={false}
                        renderItem={(quiz) => (
                            <List.Item style={{ padding: '8px 0' }}>
                                <Card 
                                    size="small"
                                    style={{ 
                                        width: '100%', 
                                        borderLeft: `4px solid ${quiz.isPrivate ? '#8c8c8c' : '#fa8c16'}` 
                                    }}
                                    bodyStyle={{ padding: '12px 16px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ overflow: 'hidden', marginRight: 16 }}>
                                            <Text strong style={{ display: 'block' }} ellipsis>
                                                {quiz.title}
                                            </Text>
                                            <Space size={4} style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                <span>{quiz.questionsCount} Qs</span>
                                                <span>•</span>
                                                {quiz.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
                                                <span>{quiz.isPrivate ? 'Private' : 'Public'}</span>
                                            </Space>
                                        </div>
                                        
                                        <Button 
                                            type="primary" 
                                            size="small"
                                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                                            icon={<PlayCircleOutlined />}
                                            onClick={() => handleOpenStartDialog(quiz.id)}
                                        >
                                            PLAY
                                        </Button>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button 
                        block
                        icon={<AppstoreOutlined />}
                        onClick={() => setIsAllFormsDialogOpen(true)}
                        style={{ color: '#fa8c16', borderColor: '#fa8c16' }}
                    >
                        Browse All Quizzes
                    </Button>
                </div>
            </Card>

            <AllQuizFormsDialog 
                open={isAllFormsDialogOpen} 
                onClose={() => setIsAllFormsDialogOpen(false)} 
            />
            
            <StartQuizRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => {
                    setStartDialogOpen(false);
                    setSelectedFormId(null);
                }}
                onConfirm={handleConfirmStart}
            />
        </>
    );
};