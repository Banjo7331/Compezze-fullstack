import React from 'react';
import { 
  Typography, 
  Tabs, 
  Card, 
  Divider, 
  theme, 
  Row, 
  Col, 
  Avatar 
} from 'antd';
import { 
  UserOutlined, 
  BarChartOutlined, 
  TrophyOutlined, 
  QuestionCircleOutlined 
} from '@ant-design/icons';

import { MyTemplatesList } from '@/features/survey/components/MyTemplatesList';
import { MySurveyRoomHistory } from '@/features/survey/components/MySurveyRoomHistory';

import { MyQuizTemplatesList } from '@/features/quiz/components/MyQuizTemplatesList';
import { MyQuizHistory } from '@/features/quiz/components/MyQuizHistory';

import { MyContestsHistory } from '@/features/contest/components/MyContestHistory';
import { useAuth } from '@/features/auth/AuthContext';

const { Title, Text, Paragraph } = Typography;

const AccountSettings = () => (
  <div style={{ maxWidth: 600 }}>
    <Title level={4}>Account Settings</Title>
    <Paragraph type="secondary">
      Functionality for changing password, avatar, and personal details will appear here soon.
    </Paragraph>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { token } = theme.useToken();
  const { currentUser } = useAuth();

  const tabItems = [
    {
      key: 'account',
      label: 'Account',
      icon: <UserOutlined />,
      children: (
        <div style={{ padding: '24px 0' }}>
          <AccountSettings />
        </div>
      ),
    },
    {
      key: 'contest',
      label: 'Contests',
      icon: <TrophyOutlined />,
      children: (
        <div style={{ padding: '24px 0' }}>
          <Title level={4}>My Contests</Title>
          <Paragraph type="secondary" style={{ marginBottom: 32 }}>
            History of events organized by you. Expand details to see stage progress and final rankings.
          </Paragraph>
          <MyContestsHistory />
        </div>
      ),
    },
    {
      key: 'quiz',
      label: 'Quizzes',
      icon: <QuestionCircleOutlined />,
      children: (
        <div style={{ padding: '24px 0' }}>
          <Title level={4}>My Quizzes</Title>
          <Paragraph type="secondary">
            Manage your games and launch new sessions.
          </Paragraph>
          
          <MyQuizTemplatesList />
          
          <Divider style={{ margin: '40px 0' }} />
          
          <Title level={4}>Game History</Title>
          <MyQuizHistory />
        </div>
      ),
    },
    {
      key: 'survey',
      label: 'Surveys',
      icon: <BarChartOutlined />,
      children: (
        <div style={{ padding: '24px 0' }}>
          <Title level={4}>My Templates</Title>
          <Paragraph type="secondary">
            Manage survey definitions. You can create new rooms or remove old templates here.
          </Paragraph>
          
          <MyTemplatesList />
          
          <Divider style={{ margin: '40px 0' }} />
          
          <Title level={4}>Session History</Title>
          <Paragraph type="secondary">
            Browse rooms launched by you (active and finished) and their results.
          </Paragraph>
          
          <MySurveyRoomHistory />
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card
        bordered={false}
        bodyStyle={{ padding: 0, overflow: 'hidden' }}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div 
          style={{ 
            backgroundColor: token.colorPrimary, 
            padding: '40px 32px', 
            color: '#fff' 
          }}
        >
          <Row align="middle" gutter={24}>
            <Col>
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#fff', color: token.colorPrimary }} 
              />
            </Col>
            <Col>
              <Title level={2} style={{ color: '#fff', margin: 0 }}>
                {currentUser?.username || 'My Profile'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                Management center for your activities
              </Text>
            </Col>
          </Row>
        </div>

        <div style={{ padding: '0 32px 32px 32px' }}>
          <Tabs 
            defaultActiveKey="contest" 
            items={tabItems} 
            size="large"
            style={{ marginTop: 16 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;