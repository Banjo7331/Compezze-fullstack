import React from 'react';
import { Card, Typography, Button } from 'antd';
import { TrophyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ContestLeaderboard } from './ContestLeaderboard';
import type { ContestLeaderboardEntryDto } from '@/features/contest/model/types';

const { Title, Text } = Typography;

interface Props {
    leaderboard: ContestLeaderboardEntryDto[];
    currentUserId?: string | null; 
    contestId: string;
}

export const ContestFinishedView: React.FC<Props> = ({ leaderboard, currentUserId, contestId }) => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
            
            <Card 
                style={{ 
                    width: '100%', 
                    maxWidth: 800, 
                    textAlign: 'center', 
                    backgroundColor: '#fffbe6',
                    borderColor: '#ffe58f',
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{ padding: 48 }}
            >
                <TrophyOutlined style={{ fontSize: 80, color: '#faad14', marginBottom: 16 }} />
                
                <Title level={2} style={{ color: '#d48806', marginBottom: 8 }}>
                    Contest Finished!
                </Title>
                
                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 32 }}>
                    Thank you for participating. Here are the final results:
                </Text>

                <div style={{ 
                    maxHeight: '500px', 
                    overflowY: 'auto', 
                    marginBottom: 32, 
                    textAlign: 'left',
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    padding: 0
                }}>
                    <ContestLeaderboard 
                        leaderboard={leaderboard} 
                        currentUserId={currentUserId} 
                    />
                </div>

                <Button 
                    type="primary" 
                    size="large" 
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/contest/${contestId}`)}
                    style={{ 
                        paddingLeft: 32, 
                        paddingRight: 32, 
                        height: 48, 
                        fontSize: 16,
                        borderRadius: 24 
                    }}
                >
                    Back to Contest Page
                </Button>

            </Card>
        </div>
    );
};