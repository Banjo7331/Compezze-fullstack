import React, { useState, useEffect } from 'react'; 
import { 
    List, Button, Pagination, Input, Tag, Card, Typography, 
    Space, Alert, Empty, Spin, message 
} from 'antd';
import { 
    SearchOutlined, 
    FileTextOutlined, 
    RocketOutlined,
    LockOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '../api/surveyService'; 
import { StartSurveyRoomDialog } from './StartSurveyRoomDialog';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { SurveyFormResponse, CreateRoomRequest } from '../model/types'; 

const { Text } = Typography;

export const SurveyFormList: React.FC = () => {
    const navigate = useNavigate(); 
    const [messageApi, contextHolder] = message.useMessage();
    
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const [data, setData] = useState<SurveyFormResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    
    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const response = await surveyService.getAllForms({ 
                    page: page - 1,
                    size: 5, 
                    sort: 'title,asc',
                    search: debouncedSearch 
                });
                setData(response.content);
                setTotalItems(response.totalElements);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load surveys");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [page, debouncedSearch]);

    useEffect(() => { setPage(1); }, [debouncedSearch]);

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
            messageApi.success("Room created successfully!");
            navigate(`/survey/room/${result.roomId}`);
        } catch (e) {
            messageApi.error("Error creating room.");
            setIsStarting(false);
        }
    };
    
    const handlePageChange = (newPage: number) => {
        setPage(newPage); 
    };

    return (
        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 8 }}>
            {contextHolder}
            
            <div style={{ marginBottom: 16, position: 'sticky', top: 0, zIndex: 1, background: '#fff', paddingTop: 8 }}>
                <Input
                    placeholder="Search surveys..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>

            {error && (
                <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            <List
                loading={isLoading}
                dataSource={data}
                locale={{
                    emptyText: (
                        <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description={search ? "No results found." : "You haven't created any surveys yet."} 
                        />
                    )
                }}
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
                                    icon={<RocketOutlined />}
                                    onClick={() => handleOpenStartDialog(survey.surveyFormId)}
                                >
                                    Launch Room
                                </Button>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

            {totalItems > 5 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination 
                        current={page} 
                        total={totalItems} 
                        pageSize={5}
                        onChange={handlePageChange} 
                        size="small"
                        showSizeChanger={false}
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
                onConfirm={handleConfirmStart}
            />
        </div>
    );
};