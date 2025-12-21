import React from 'react';
import { Typography, Row, Col, Card, Button, theme } from 'antd';
import { Link } from 'react-router-dom';
import { 
  TrophyOutlined, 
  PlusOutlined, 
  GlobalOutlined, 
  RocketOutlined 
} from '@ant-design/icons';

import { UpcomingContestWidget } from '@/features/contest/components/UpcomingContestWidget';
import { ContestPublicList } from '@/features/contest/components/ContestPublicList';

const { Title, Text, Paragraph } = Typography;

const ContestPage: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      
      <div style={{ marginBottom: 40 }}>
        <UpcomingContestWidget />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1} style={{ margin: 0, color: token.colorTextHeading }}>
          <TrophyOutlined style={{ color: token.colorWarning, marginRight: 12 }} />
          Contest Hub
        </Title>
        <Text type="secondary" style={{ fontSize: 18 }}>
          Join the competition, test your skills, and win!
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{ 
              height: '100%', 
              textAlign: 'center', 
              borderColor: token.colorPrimaryBorder,
              backgroundColor: token.colorBgContainer 
            }}
          >
            <div style={{ padding: '24px 0' }}>
              <RocketOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
              <Title level={3}>Organizer</Title>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                Create your own multi-stage contest and invite participants.
              </Paragraph>
              
              <Link to="/contest/create">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<PlusOutlined />} 
                  style={{ width: '100%' }}
                >
                  Create New
                </Button>
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              paddingBottom: 16,
              marginBottom: 24
            }}>
              <GlobalOutlined style={{ fontSize: 24, color: token.colorPrimary, marginRight: 12 }} />
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: 0 }}>Open Registrations</Title>
                <Text type="secondary">Browse active contests you can join right now</Text>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <ContestPublicList />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ContestPage;