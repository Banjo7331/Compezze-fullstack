import React, { useState } from 'react';
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

import { useUserSurveyForms } from '../hooks/useUserSurveyForms';
import { surveyService } from '../api/surveyService';
import type { CreateRoomRequest } from '../model/types';

import { AllFormsDialog } from './AllFormsDialog';
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';

const { Title, Text } = Typography;

export const FeaturedFormsWidget: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    
    const [isAllFormsDialogOpen, setIsAllFormsDialogOpen] = useState(false);
    
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    
    const { data, isLoading, error } = useUserSurveyForms({ 
        size: 3, 
        sort: 'id,desc' 
    });

    const handleOpenStartDialog = (id: number) => {
        setSelectedFormId(id);
        setStartDialogOpen(true);
    };

    const handleConfirmStart = async (config: { duration: number, maxParticipants: number }) => {
        if (!selectedFormId) return;

        setIsStarting(true);
        try {
            const request: CreateRoomRequest = {
                surveyFormId: selectedFormId,
                maxParticipants: config.maxParticipants,
                durationMinutes: config.duration
            };
            const result = await surveyService.createRoom(request);
            messageApi.success("Session started!");
            navigate(`/survey/room/${result.roomId}`);
        } catch (e) {
            messageApi.error("Failed to launch room.");
            setIsStarting(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Card 
                style={{ 
                    height: '100%', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: 12,
                    border: '1px solid #f0f0f0' 
                }}
                bodyStyle={{ padding: 32 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <ThunderboltOutlined style={{ marginRight: 12, fontSize: 24, color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>Quick Start</Title>
                </div>
                
                <Divider style={{ margin: '16px 0 24px 0' }} />

                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Your recent templates:
                </Text>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                ) : error ? (
                    <div style={{ textAlign: 'center', color: 'red' }}>Error loading data</div>
                ) : (data?.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                        No templates found.
                    </div>
                ) : (
                    <List
                        dataSource={data}
                        split={false}
                        renderItem={(survey) => (
                            <List.Item style={{ padding: '8px 0' }}>
                                <Card 
                                    size="small"
                                    style={{ 
                                        width: '100%', 
                                        borderLeft: `4px solid ${survey.isPrivate ? '#8c8c8c' : '#1890ff'}` 
                                    }}
                                    bodyStyle={{ padding: '12px 16px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ overflow: 'hidden', marginRight: 16 }}>
                                            <Text strong style={{ display: 'block' }} ellipsis>
                                                {survey.title}
                                            </Text>
                                            <Space size={4} style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                {survey.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
                                                <span>{survey.isPrivate ? 'Private' : 'Public'}</span>
                                            </Space>
                                        </div>
                                        
                                        <Button 
                                            type="primary" 
                                            size="small"
                                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                            icon={<PlayCircleOutlined />}
                                            onClick={() => handleOpenStartDialog(survey.surveyFormId!)}
                                        >
                                            Start
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
                    >
                        All Templates
                    </Button>
                </div>
            </Card>

            <AllFormsDialog 
                open={isAllFormsDialogOpen} 
                onClose={() => setIsAllFormsDialogOpen(false)} 
            />
            
            <StartSurveyRoomDialog 
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