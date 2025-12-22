import React, { useMemo } from 'react';
import { Card, List, Avatar, Typography, Divider, Badge } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import type { ContestLeaderboardEntryDto } from '../../model/types';

const { Text, Title } = Typography;

type LeaderboardEntryWithAvatar = ContestLeaderboardEntryDto & {
    avatarUrl?: string;
};

interface Props {
    leaderboard: LeaderboardEntryWithAvatar[];
    currentUserId?: string | null;
}

export const ContestLeaderboard: React.FC<Props> = ({ leaderboard, currentUserId }) => {
    
    const { displayedRows, showSeparator } = useMemo(() => {
        const TOP_LIMIT = 10;
        const topPlayers = leaderboard.slice(0, TOP_LIMIT);
        const myEntry = leaderboard.find(p => p.userId === currentUserId);
        const amIInTop = myEntry && myEntry.rank <= TOP_LIMIT;

        if (myEntry && !amIInTop) {
            return {
                displayedRows: [...topPlayers, { ...myEntry, isSeparator: true }],
                showSeparator: true 
            };
        }

        return {
            displayedRows: topPlayers,
            showSeparator: false
        };
    }, [leaderboard, currentUserId]);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#f0f0f0';
        }
    };

    const getRankTextColor = (rank: number) => {
         return rank <= 3 ? '#fff' : '#666';
    };

    return (
        <Card 
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />
                    <span>Top Scores</span>
                </div>
            }
            bodyStyle={{ padding: 0, height: '100%', overflowY: 'auto' }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <List
                itemLayout="horizontal"
                dataSource={displayedRows}
                renderItem={(item: any, index) => {
                    const isMe = item.userId === currentUserId;
                    const isSeparator = showSeparator && index === displayedRows.length - 1;

                    const separatorNode = isSeparator ? (
                         <div style={{ textAlign: 'center', padding: '4px', color: '#ccc' }}>• • •</div>
                    ) : null;

                    return (
                        <>
                            {separatorNode}
                            <List.Item 
                                style={{ 
                                    padding: '12px 16px',
                                    background: isMe ? '#e6f7ff' : 'transparent',
                                    borderLeft: isMe ? '3px solid #1890ff' : '3px solid transparent'
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge 
                                            count={item.rank} 
                                            style={{ 
                                                backgroundColor: getRankColor(item.rank), 
                                                color: getRankTextColor(item.rank),
                                                borderColor: getRankColor(item.rank),
                                                boxShadow: 'none'
                                            }}
                                            offset={[0, 30]}
                                        >
                                            <Avatar 
                                                src={item.avatarUrl} 
                                                style={{ backgroundColor: getRankColor(item.rank) }}
                                                size="large"
                                            >
                                                {item.displayName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </Badge>
                                    }
                                    title={
                                        <Text strong={isMe} ellipsis style={{ maxWidth: 100, display: 'block' }}>
                                            {item.displayName} {isMe && <Text type="secondary" style={{ fontSize: 10 }}>(You)</Text>}
                                        </Text>
                                    }
                                    description={
                                        <Text strong style={{ color: '#1890ff' }}>{item.totalScore} pts</Text>
                                    }
                                />
                            </List.Item>
                        </>
                    );
                }}
            />
            
            {leaderboard.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                    No scores yet.
                </div>
            )}
        </Card>
    );
};