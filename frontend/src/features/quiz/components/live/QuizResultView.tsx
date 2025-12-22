import React from 'react';
import { Card, Typography, Button, Divider, List, Avatar, Space } from 'antd';
import { TrophyOutlined, CloseOutlined, ArrowRightOutlined } from '@ant-design/icons';

import { QuizRoomStatus } from '../../model/types';
import type { LeaderboardEntryDto } from '../../model/socket.types';

const { Title, Text } = Typography;

interface QuizResultViewProps {
    status: string;
    isHost: boolean;
    leaderboard: LeaderboardEntryDto[];
    onNext: () => void;
    onClose: () => void; 
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({ 
    status, 
    isHost, 
    leaderboard, 
    onNext, 
    onClose 
}) => {
    const isFinished = status === QuizRoomStatus.FINISHED;

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; 
            case 2: return '#C0C0C0'; 
            case 3: return '#CD7F32'; 
            default: return '#f0f0f0';
        }
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ marginBottom: 32 }}>
                {isFinished ? (
                    <>
                        <TrophyOutlined style={{ fontSize: 80, color: '#FFD700', marginBottom: 16 }} />
                        <Title level={2}>Game Over!</Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>Final Results</Text>
                    </>
                ) : (
                    <>
                        <Title level={2}>Time's Up! ⏳</Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>Check out the current leaderboard.</Text>
                    </>
                )}
            </div>

            <Card style={{ marginBottom: 32 }}>
                <Divider orientation="left">TOP 5</Divider>
                <List
                    itemLayout="horizontal"
                    dataSource={leaderboard.slice(0, 5)}
                    locale={{ emptyText: "No results yet..." }}
                    renderItem={(entry) => (
                        <List.Item style={{ 
                            background: entry.rank === 1 ? '#fffbe6' : 'transparent',
                            padding: '12px 24px',
                            borderBottom: '1px solid #f0f0f0'
                        }}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar 
                                        style={{ 
                                            backgroundColor: getRankColor(entry.rank),
                                            color: entry.rank <= 3 ? '#fff' : '#666',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {entry.rank}
                                    </Avatar>
                                }
                                title={<Text strong style={{ fontSize: 16 }}>{entry.nickname}</Text>}
                            />
                            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                                {entry.score} <span style={{ fontSize: 12, color: '#999', fontWeight: 'normal' }}>pts</span>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            {isHost && !isFinished && (
                <Space size="large">
                    <Button 
                        danger 
                        size="large" 
                        onClick={onClose}
                        icon={<CloseOutlined />}
                    >
                        End Quiz
                    </Button>
                    <Button 
                        type="primary" 
                        size="large" 
                        onClick={onNext}
                        icon={<ArrowRightOutlined />}
                    >
                        Next Question
                    </Button>
                </Space>
            )}
            
            {!isHost && !isFinished && (
                <Text type="secondary" italic>Waiting for host...</Text>
            )}
        </div>
    );
};