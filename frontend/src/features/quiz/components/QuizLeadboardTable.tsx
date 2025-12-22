import React from 'react';
import { Table, Typography, Empty, Tag } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import type { LeaderboardEntryDto } from '../model/socket.types';

const { Text } = Typography;

interface Props {
    leaderboard: LeaderboardEntryDto[];
}

export const QuizLeaderboardTable: React.FC<Props> = ({ leaderboard }) => {
    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center' as const,
            render: (rank: number) => {
                let icon = <span>#{rank}</span>;
                if (rank === 1) icon = <span style={{ fontSize: 20 }}>🥇</span>;
                if (rank === 2) icon = <span style={{ fontSize: 20 }}>🥈</span>;
                if (rank === 3) icon = <span style={{ fontSize: 20 }}>🥉</span>;
                return icon;
            },
        },
        {
            title: 'Player',
            dataIndex: 'nickname',
            key: 'nickname',
            render: (text: string, record: LeaderboardEntryDto) => (
                <Text strong={record.rank <= 3}>{text}</Text>
            ),
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            align: 'right' as const,
            render: (score: number) => (
                <Text type="success" strong>{score} pts</Text>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={leaderboard}
            rowKey={(record) => record.userId || record.rank.toString()}
            pagination={false}
            size="small"
            locale={{ emptyText: <Empty description="No leaderboard data available." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            rowClassName={(record) => record.rank <= 3 ? 'top-rank-row' : ''}
            style={{ marginTop: 16 }}
        />
    );
};