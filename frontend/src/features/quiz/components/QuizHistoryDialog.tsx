import React, { useEffect, useState } from 'react';
import { Modal, Typography, Spin, Alert, Divider, Tag, Space, Button } from 'antd';
import { 
    CalendarOutlined, 
    UserOutlined, 
    TrophyOutlined 
} from '@ant-design/icons';

import { quizService } from '../api/quizService';
import type { GetQuizRoomDetailsResponse } from '../model/types';
import { QuizLeaderboardTable } from './QuizLeadboardTable';

const { Title, Text } = Typography;

interface QuizHistoryDialogProps {
    roomId: string | null;
    open: boolean;
    onClose: () => void;
}

export const QuizHistoryDialog: React.FC<QuizHistoryDialogProps> = ({ roomId, open, onClose }) => {
    const [data, setData] = useState<GetQuizRoomDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && roomId) {
            const load = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const details = await quizService.getRoomDetails(roomId);
                    setData(details);
                } catch (err) {
                    setError("Failed to load leaderboard data.");
                } finally {
                    setIsLoading(false);
                }
            };
            load();
        }
    }, [open, roomId]);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrophyOutlined style={{ color: '#fa8c16' }} />
                    <span>Quiz Results</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
            width={600}
            centered
        >
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert message="Error" description={error} type="error" showIcon />
            ) : data ? (
                <div>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>{data.quizTitle}</Title>
                        
                        <Space>
                            <Tag icon={<UserOutlined />}>
                                {data.currentParticipants} players
                            </Tag>
                            <Tag 
                                icon={<CalendarOutlined />} 
                                color={data.status === 'FINISHED' ? 'default' : 'green'}
                            >
                                {data.status === 'FINISHED' ? 'Finished' : 'Active'}
                            </Tag>
                        </Space>
                    </div>

                    <Divider orientation="left" style={{ fontSize: 14 }}>
                        <TrophyOutlined /> TOP 5 LEADERBOARD
                    </Divider>

                    <QuizLeaderboardTable
                        leaderboard={data.currentResults?.leaderboard || []} 
                    />
                </div>
            ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                    No data available.
                </div>
            )}
        </Modal>
    );
};