import React from 'react';
import { Card, Typography, Spin, Tag, Button, Empty, Row, Col } from 'antd';
import { UserOutlined, RocketOutlined, TrophyOutlined } from '@ant-design/icons';
import type { LeaderboardEntryDto } from '../../model/socket.types';

const { Title, Text } = Typography;

interface QuizLobbyProps {
    isHost: boolean;
    roomId: string;
    participants: LeaderboardEntryDto[];
    onStart: () => void;
}

export const QuizLobby: React.FC<QuizLobbyProps> = ({ isHost, roomId, participants, onStart }) => {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <TrophyOutlined style={{ fontSize: 64, color: '#fa8c16', marginBottom: 16 }} />
                <Title level={2}>
                    {isHost ? "Host Panel" : "Waiting for start..."}
                </Title>
            </div>

            <Card title={`Players Joined (${participants.length})`} extra={participants.length > 0 && <Spin />}>
                <div style={{ minHeight: 100 }}>
                    {participants.length === 0 ? (
                        <Empty description="Waiting for players..." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {participants.map((p, idx) => (
                                <Tag key={idx} color="blue" style={{ padding: '6px 12px', fontSize: 14 }}>
                                    <UserOutlined style={{ marginRight: 6 }} />
                                    {p.nickname}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {isHost && (
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <Button 
                        type="primary"
                        size="large" 
                        onClick={onStart} 
                        disabled={participants.length === 0}
                        icon={<RocketOutlined />}
                        style={{ height: 50, fontSize: 18, paddingLeft: 40, paddingRight: 40, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        START QUIZ
                    </Button>
                </div>
            )}
        </div>
    );
};