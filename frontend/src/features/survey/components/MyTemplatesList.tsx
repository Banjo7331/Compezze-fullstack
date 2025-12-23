import React, { useState, useEffect } from 'react';
import { 
    List, Typography, Button, Pagination, Spin, Tooltip, 
    Popconfirm, message, Tag, Space, Empty 
} from 'antd';
import { 
    DeleteOutlined, 
    PlayCircleOutlined, 
    PlusOutlined,
    LockOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '../api/surveyService';
import { Button as CustomButton } from '@/shared/ui/Button';
import type { MySurveyFormDto, CreateRoomRequest } from '../model/types';
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';

const { Text } = Typography;

export const MyTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    
    const [forms, setForms] = useState<MySurveyFormDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await surveyService.getMyForms({ page, size: 5, sort: 'createdAt,desc' });
                setForms(data.content);
                setTotalItems(data.totalElements);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [page, refreshTrigger]);

    const openStartDialog = (formId: number) => {
        setSelectedFormId(formId);
        setStartDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await surveyService.deleteForm(id);
            messageApi.success("Template deleted.");
            setRefreshTrigger(prev => prev + 1);
        } catch (e: any) {
            messageApi.error("Failed to delete (check active sessions).");
        }
    };

    const handleQuickLaunch = async (config: { duration: number, maxParticipants: number }) => {
        if (!selectedFormId) return;

        setIsStarting(true);
        try {
            const request: CreateRoomRequest = {
                surveyFormId: selectedFormId,
                maxParticipants: config.maxParticipants,
                durationMinutes: config.duration
            };
            
            const result = await surveyService.createRoom(request);
            messageApi.success("Room created successfully!");
            navigate(`/survey/room/${result.roomId}`);
            
        } catch (e) {
            messageApi.error("Error creating room.");
            setIsStarting(false);
        }
    };

    if (isLoading && forms.length === 0) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;

    if (forms.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="You have no survey templates."
            >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/survey/create')}>
                    Create First Survey
                </Button>
            </Empty>
        );
    }

    return (
        <div>
            {contextHolder}
            <List
                dataSource={forms}
                renderItem={(form) => (
                    <List.Item
                        actions={[
                            <Tooltip title="Launch New Session" key="launch">
                                <Button 
                                    type="text" 
                                    icon={<PlayCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />} 
                                    onClick={() => openStartDialog(form.id)}
                                />
                            </Tooltip>,
                            <Popconfirm
                                title="Delete this template?"
                                description="You won't be able to start new sessions from it."
                                onConfirm={() => handleDelete(form.id)}
                                okText="Yes"
                                cancelText="No"
                                key="delete"
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ]}
                        style={{ 
                            padding: '12px 16px', 
                            borderLeft: '4px solid #1890ff',
                            marginBottom: 12,
                            background: '#fff',
                            border: '1px solid #f0f0f0',
                            borderRadius: 4
                        }}
                    >
                        <List.Item.Meta
                            title={<Text strong>{form.title}</Text>}
                            description={
                                <Space size={4} style={{ fontSize: 12 }}>
                                    {form.isPrivate ? <Tag icon={<LockOutlined />}>Private</Tag> : <Tag icon={<GlobalOutlined />}>Public</Tag>}
                                    <Text type="secondary">• {form.questionsCount} questions • {new Date(form.createdAt).toLocaleDateString()}</Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />

            {totalItems > 5 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination 
                        current={page + 1}
                        total={totalItems} 
                        pageSize={5}
                        onChange={(p) => setPage(p - 1)} 
                        size="small"
                    />
                </div>
            )}

            <StartSurveyRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => {
                    setStartDialogOpen(false);
                    setSelectedFormId(null);
                }}
                onConfirm={handleQuickLaunch}
            />
        </div>
    );
};