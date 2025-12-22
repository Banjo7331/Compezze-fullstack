import React, { useState, useEffect } from 'react';
import { 
    List, Typography, Button, Pagination, Spin, Tooltip, 
    Popconfirm, message, Space, Empty, Tag 
} from 'antd';
import { 
    DeleteOutlined, 
    PlayCircleOutlined, 
    PlusOutlined,
    LockOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import type { MyQuizFormDto, CreateQuizRoomRequest } from '../model/types';
import { StartQuizRoomDialog } from './StartQuizRoomDialog';

const { Text } = Typography;

export const MyQuizTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    
    const [forms, setForms] = useState<MyQuizFormDto[]>([]);
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
                const data = await quizService.getMyForms({ page, size: 5, sort: 'createdAt,desc' });
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

    const handleDelete = async (id: number) => {
        try {
            await quizService.deleteForm(id);
            messageApi.success("Quiz deleted.");
            setRefreshTrigger(p => p + 1);
        } catch (e: any) {
            messageApi.error("Failed to delete (active games might exist).");
        }
    };

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
            messageApi.error("Start failed.");
            setIsStarting(false);
        }
    };

    if (isLoading && forms.length === 0) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;

    if (forms.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No quizzes found."
            >
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/quiz/create')}>
                    Create your first Quiz
                </Button>
            </Empty>
        );
    }

    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 4 }}>
            {contextHolder}
            <List
                dataSource={forms}
                renderItem={(form) => (
                    <List.Item
                        actions={[
                            <Tooltip title="Play" key="play">
                                <Button 
                                    type="text" 
                                    icon={<PlayCircleOutlined style={{ color: '#fa8c16', fontSize: 18 }} />} 
                                    onClick={() => handleOpenStartDialog(form.id)}
                                />
                            </Tooltip>,
                            <Popconfirm
                                title="Delete this quiz?"
                                description="Are you sure to delete this quiz?"
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
                            borderLeft: '4px solid #fa8c16',
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
                                    <span>{form.questionsCount} Qs</span>
                                    <span>•</span>
                                    {form.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
                                    <span>{form.isPrivate ? "Private" : "Public"}</span>
                                    <span>•</span>
                                    <span>{new Date(form.createdAt).toLocaleDateString()}</span>
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

            <StartQuizRoomDialog 
                open={startDialogOpen}
                isLoading={isStarting}
                onClose={() => {
                    setStartDialogOpen(false);
                    setSelectedFormId(null);
                }}
                onConfirm={handleConfirmStart}
            />
        </div>
    );
};