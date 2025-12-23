import React, { useEffect, useState } from 'react';
import { 
    List, Button, Pagination, Input, Tag, Card, Typography, 
    Space, Alert, Empty, Spin 
} from 'antd';
import { 
    SearchOutlined, 
    UserOutlined, 
    FormOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '../api/surveyService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { ActiveRoomResponse } from '../model/types';

const { Text } = Typography;

export const ActiveRoomsList: React.FC = () => {
    const navigate = useNavigate();
    
    const [rooms, setRooms] = useState<ActiveRoomResponse[]>([]);
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
                const data = await surveyService.getActiveRooms({ 
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
                setError("Failed to fetch active surveys.");
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
                    placeholder="Search active surveys..."
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
                            description={search ? "No surveys found." : "No active surveys right now."} 
                        />
                    )
                }}
                renderItem={(room) => (
                    <Card 
                        hoverable
                        style={{ marginBottom: 16, borderLeft: '4px solid #52c41a' }}
                        bodyStyle={{ padding: '16px 24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <FormOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                    <Text strong style={{ fontSize: 16 }}>{room.surveyTitle}</Text>
                                </div>
                                
                                <Space>
                                    <Tag icon={<UserOutlined />}>
                                        {room.currentParticipants} / {room.maxParticipants || '∞'}
                                    </Tag>
                                </Space>
                            </div>

                            <Button 
                                type="primary" 
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<LoginOutlined />}
                                onClick={() => navigate(`/survey/join/${room.roomId}`)}
                            >
                                Join
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