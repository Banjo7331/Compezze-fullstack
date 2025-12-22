import React from 'react';
import { Typography, Tag, Space, theme, Row, Col } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  LockOutlined,
  TrophyOutlined 
} from '@ant-design/icons';
import type { ContestDetailsDto } from '@/features/contest/model/types';

const { Title, Text } = Typography;

interface Props {
  contest: ContestDetailsDto;
}

export const ContestHeader: React.FC<Props> = ({ contest }) => {
  const { token } = theme.useToken();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'warning';
      case 'FINISHED': return 'default';
      default: return 'processing';
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        borderRadius: token.borderRadiusLG, 
        overflow: 'hidden', 
        marginBottom: 24,
        background: '#000',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}
    >
      {contest.coverUrl && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${contest.coverUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.6, zIndex: 1
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)',
        zIndex: 2
      }} />

      <div style={{ position: 'relative', zIndex: 3, padding: 32 }}>
        <Space style={{ marginBottom: 16 }}>
          <Tag color="orange" style={{ fontWeight: 600 }}>{contest.category}</Tag>
          <Tag color={getStatusColor(contest.status)}>
            {contest.status === 'ACTIVE' ? 'LIVE' : contest.status}
          </Tag>
          {contest.private && <Tag icon={<LockOutlined />} color="default">Private</Tag>}
        </Space>

        <Title level={1} style={{ color: '#fff', margin: '0 0 16px 0', fontSize: 40 }}>
          {contest.name}
        </Title>

        <Row gutter={[24, 12]} style={{ color: 'rgba(255,255,255,0.85)' }}>
          <Col>
            <Space>
              <UserOutlined style={{ color: token.colorWarning }} />
              <Text style={{ color: 'inherit' }}>
                {contest.currentParticipantsCount} / {contest.participantLimit || '∞'} Participants
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <CalendarOutlined style={{ color: token.colorWarning }} />
              <Text style={{ color: 'inherit' }}>
                {new Date(contest.startDate).toLocaleDateString()}
              </Text>
            </Space>
          </Col>
          {contest.location && (
            <Col>
              <Space>
                <EnvironmentOutlined style={{ color: token.colorWarning }} />
                <Text style={{ color: 'inherit' }}>{contest.location}</Text>
              </Space>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};