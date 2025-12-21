import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Skeleton, Button, Space, theme, Row, Col } from 'antd';
import { 
  TrophyOutlined, 
  CalendarOutlined, 
  ArrowRightOutlined, 
  UnorderedListOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { contestService } from '../api/contestService';
import type { UpcomingContestDto } from '../model/types';
import { MyEnteredContestsDialog } from './MyEnteredContestsDialog';

const { Title, Text } = Typography;

export const UpcomingContestWidget: React.FC = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  
  const [contest, setContest] = useState<UpcomingContestDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await contestService.getUpcomingContest();
        setContest(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 32, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  if (!contest) return null;

  const isLive = new Date(contest.startDate) <= new Date();

  return (
    <>
      <Card
        bordered={false}
        style={{
          marginBottom: 32,
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorWarning} 100%)`,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(250, 140, 22, 0.4)',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space align="center" style={{ marginBottom: 8 }}>
              <TrophyOutlined style={{ fontSize: 20, color: '#fff' }} />
              <Text strong style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 1 }}>
                YOUR UPCOMING CONTEST
              </Text>
              {contest.isOrganizer && (
                <Tag color="#fff" style={{ color: token.colorPrimary, fontWeight: 'bold', border: 'none' }}>
                  ORGANIZER
                </Tag>
              )}
            </Space>

            <Title level={2} style={{ color: '#fff', marginTop: 8, marginBottom: 16 }}>
              {contest.name}
            </Title>

            <Space size="large" wrap>
              <Space>
                <CalendarOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />
                <Text style={{ color: '#fff' }}>
                  Starts: {new Date(contest.startDate).toLocaleString()}
                </Text>
              </Space>
              
              <Tag style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: '#fff', 
                fontSize: 14, 
                padding: '4px 10px' 
              }}>
                {contest.category}
              </Tag>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space direction="vertical" align="end" style={{ width: '100%' }}>
              <Button
                size="large"
                ghost
                icon={<UnorderedListOutlined />}
                onClick={() => setIsDialogOpen(true)}
                style={{ color: '#fff', borderColor: '#fff', width: '100%', maxWidth: 200 }}
              >
                OTHERS
              </Button>
              
              <Button
                size="large"
                style={{ 
                  backgroundColor: '#fff', 
                  color: token.colorPrimary, 
                  border: 'none', 
                  fontWeight: 'bold',
                  width: '100%',
                  maxWidth: 200
                }}
                onClick={() => navigate(`/contest/${contest.id}`)}
              >
                {isLive ? "ENTER NOW" : "DETAILS"} <ArrowRightOutlined />
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <MyEnteredContestsDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};