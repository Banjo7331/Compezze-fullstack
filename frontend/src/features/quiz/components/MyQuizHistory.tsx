import React, { useState, useEffect } from 'react';
import { List, Typography, Tag, Button, Pagination, Spin, Tooltip, Empty, Space } from 'antd';
import { TrophyOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';

import { quizService } from '../api/quizService';
import type { MyQuizRoomDto } from '../model/types';
import { QuizHistoryDialog } from './QuizHistoryDialog';

const { Text } = Typography;

export const MyQuizHistory: React.FC = () => {
    const [rooms, setRooms] = useState<MyQuizRoomDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await quizService.getMyRoomsHistory({ page, size: 5, sort: 'createdAt,desc' });
                setRooms(data.content);
                setTotalItems(data.totalElements);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [page]);

    const handleOpenResults = (roomId: string) => {
        setSelectedRoomId(roomId);
        setIsDialogOpen(true);
    };

    if (isLoading && rooms.length === 0) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;
    if (rooms.length === 0) return <Empty description="No game history found." image={Empty.PRESENTED_IMAGE_SIMPLE} />;

    return (
        <div>
            <List
                dataSource={rooms}
                renderItem={(room) => (
                    <List.Item
                        actions={[
                            <Tooltip title="View Leaderboard" key="view">
                                <Button 
                                    type="text" 
                                    icon={<TrophyOutlined style={{ color: '#fa8c16' }} />} 
                                    onClick={() => handleOpenResults(room.roomId)}
                                />
                            </Tooltip>
                        ]}
                        style={{ 
                            padding: '16px', 
                            borderLeft: `4px solid ${room.status === 'FINISHED' ? '#d9d9d9' : '#fa8c16'}`,
                            marginBottom: 16,
                            background: '#fff',
                            border: '1px solid #f0f0f0',
                            borderRadius: 4
                        }}
                    >
                        <List.Item.Meta
                            avatar={<HistoryOutlined style={{ fontSize: 24, color: '#fa8c16' }} />}
                            title={<Text strong>{room.quizTitle}</Text>}
                            description={
                                <Space wrap>
                                    <Tag color={room.status === 'FINISHED' ? 'default' : 'orange'}>
                                        {room.status === 'FINISHED' ? "FINISHED" : "IN PROGRESS"}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <UserOutlined /> {room.totalParticipants} players • {new Date(room.createdAt).toLocaleDateString()}
                                    </Text>
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

            <QuizHistoryDialog 
                open={isDialogOpen} 
                roomId={selectedRoomId} 
                onClose={() => setIsDialogOpen(false)} 
            />
        </div>
    );
};