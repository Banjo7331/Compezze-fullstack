import React, { useEffect, useState } from 'react';
import { 
    List, Button, Pagination, Input, Tag, Card, Typography, 
    Space, Alert, Empty, Spin 
} from 'antd';
import { 
    SearchOutlined, 
    UserOutlined, 
    TrophyOutlined, 
    LoginOutlined,
    ClockCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { GetActiveQuizRoomResponse } from '../model/types';

const { Text, Title } = Typography;

export const QuizActiveRoomsList: React.FC = () => {
    const navigate = useNavigate();
    
    const [rooms, setRooms] = useState<GetActiveQuizRoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                const data = await quizService.getActiveRooms({ 
                    page: page - 1, 
                    size: 10, 
                    sort: 'createdAt,desc',
                    search: debouncedSearch 
                });
                setRooms(data.content);
                setTotalItems(data.totalElements);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch active games.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [page, debouncedSearch]);

    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Input
                    size="large"
                    placeholder="Search active games by title..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>

            {error && (
                <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 24 }} />
            )}

            <List
                loading={isLoading}
                itemLayout="horizontal"
                dataSource={rooms}
                locale={{
                    emptyText: (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description={search ? "No games found matching query." : "No active games at the moment."} 
                        />
                    )
                }}
                renderItem={(room) => (
                    <Card 
                        hoverable
                        style={{ marginBottom: 16, borderLeft: '4px solid #fa8c16' }}
                        bodyStyle={{ padding: '16px 24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <TrophyOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                                    <Text strong style={{ fontSize: 16 }}>{room.quizTitle}</Text>
                                </div>
                                
                                <Space wrap>
                                    <Tag color={room.status === 'LOBBY' ? 'success' : 'warning'} icon={room.status === 'LOBBY' ? <ClockCircleOutlined /> : null}>
                                        {room.status === 'LOBBY' ? "IN LOBBY" : "GAME IN PROGRESS"}
                                    </Tag>
                                    <Tag icon={<UserOutlined />}>
                                        {room.participantsCount} / {room.maxParticipants || '∞'}
                                    </Tag>
                                </Space>
                            </div>

                            <Button 
                                type="primary" 
                                style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                                icon={<LoginOutlined />}
                                onClick={() => navigate(`/quiz/join/${room.roomId}`)}
                            >
                                JOIN
                            </Button>
                        </div>
                    </Card>
                )}
            />

            {totalItems > 10 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <Pagination 
                        current={page} 
                        total={totalItems} 
                        pageSize={10}
                        onChange={handlePageChange} 
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};