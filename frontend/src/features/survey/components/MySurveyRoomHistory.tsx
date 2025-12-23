import React, { useState, useEffect } from 'react';
import { 
    List, Typography, Button, Pagination, Spin, Tooltip, 
    Tag, Space, Empty 
} from 'antd';
import { EyeOutlined, BarChartOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '@/features/survey/api/surveyService';
import type { MySurveyRoomDto } from '@/features/survey/model/types';
import { SurveyRoomResultsDialog } from '@/features/survey/components/SurveyRoomResultsDialog';

const { Text } = Typography;

export const MySurveyRoomHistory: React.FC = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<MySurveyRoomDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenResults = (id: string) => {
        setSelectedRoomId(id);
        setIsDialogOpen(true);
    };

    const handleCloseResults = () => {
        setIsDialogOpen(false);
        setSelectedRoomId(null);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await surveyService.getMyRoomsHistory({ page, size: 5, sort: 'createdAt,desc' });
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

    if (isLoading && rooms.length === 0) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;

    if (rooms.length === 0) {
        return <Empty description="No session history found." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <div>
            <List
                dataSource={rooms}
                renderItem={(room) => (
                    <List.Item
                        actions={[
                            <Tooltip title="View Results" key="view">
                                <Button 
                                    type="text" 
                                    icon={<EyeOutlined style={{ color: '#1890ff', fontSize: 18 }} />} 
                                    onClick={() => handleOpenResults(room.roomId)}
                                />
                            </Tooltip>
                        ]}
                        style={{ 
                            padding: '12px 16px', 
                            borderLeft: `4px solid ${room.isOpen ? '#52c41a' : '#d9d9d9'}`,
                            marginBottom: 12,
                            background: '#fff',
                            border: '1px solid #f0f0f0',
                            borderRadius: 4
                        }}
                    >
                        <List.Item.Meta
                            title={<Text strong>{room.surveyTitle}</Text>}
                            description={
                                <Space wrap size={8}>
                                    <Tag color={room.isOpen ? "success" : "default"}>
                                        {room.isOpen ? "ACTIVE" : "FINISHED"}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <Space>
                                            <span><UserOutlined /> {room.totalParticipants}</span>
                                            <span><BarChartOutlined /> {room.totalSubmissions}</span>
                                            <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                                        </Space>
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

            <SurveyRoomResultsDialog 
                open={isDialogOpen}
                roomId={selectedRoomId}
                onClose={handleCloseResults}
            />
        </div>
    );
};