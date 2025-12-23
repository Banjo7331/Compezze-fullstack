import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  theme, 
  Row, 
  Col, 
  Avatar, 
  Menu,
  Layout,
  Grid
} from 'antd';
import { 
  UserOutlined, 
  BarChartOutlined, 
  TrophyOutlined, 
  QuestionCircleOutlined,
  AppstoreOutlined,
  RocketOutlined
} from '@ant-design/icons';

import { MyTemplatesList } from '@/features/survey/components/MyTemplatesList';
import { MySurveyRoomHistory } from '@/features/survey/components/MySurveyRoomHistory';
import { MyQuizTemplatesList } from '@/features/quiz/components/MyQuizTemplatesList';
import { MyQuizHistory } from '@/features/quiz/components/MyQuizHistory';
import { MyContestsHistory } from '@/features/contest/components/MyContestHistory';
import { useAuth } from '@/features/auth/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AccountSettings = () => (
  <div style={{ maxWidth: 600 }}>
    <Title level={4}>Account Settings</Title>
    <Paragraph type="secondary">
      Change password, update avatar, and manage personal details.
    </Paragraph>
  </div>
);

const ContestSection = () => (
  <div>
    <Title level={4}>My Contests</Title>
    <Paragraph type="secondary" style={{ marginBottom: 32 }}>
      Manage events and track rankings.
    </Paragraph>
    <MyContestsHistory />
  </div>
);

const QuizSection = () => (
  <div>
    <Title level={4}>My Quizzes</Title>
    <Paragraph type="secondary">Manage your games.</Paragraph>
    <MyQuizTemplatesList />
    <DividerWithText text="History" />
    <MyQuizHistory />
  </div>
);

const SurveySection = () => (
  <div>
    <Title level={4}>My Surveys</Title>
    <Paragraph type="secondary">Manage feedback forms.</Paragraph>
    <MyTemplatesList />
    <DividerWithText text="Session History" />
    <MySurveyRoomHistory />
  </div>
);

const DividerWithText = ({ text }: { text: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '40px 0 24px 0' }}>
    <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
    <span style={{ padding: '0 16px', color: '#999', fontWeight: 500, fontSize: 12, textTransform: 'uppercase' }}>{text}</span>
    <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
  </div>
);

export const ProfilePage: React.FC = () => {
  const { token } = theme.useToken();
  const { currentUser } = useAuth();
  const screens = useBreakpoint();
  
  const [selectedKey, setSelectedKey] = useState('account');

  const menuItems = [
    {
      key: 'grp-general',
      label: 'General',
      type: 'group',
      children: [
        { key: 'account', icon: <UserOutlined />, label: 'Account Profile' },
        { key: 'contest', icon: <TrophyOutlined />, label: 'Contests' },
      ]
    },
    {
      key: 'grp-activities', 
      icon: <AppstoreOutlined />, 
      label: 'Other activities',
      children: [
        { key: 'quiz', icon: <QuestionCircleOutlined />, label: 'Quizzes' },
        { key: 'survey', icon: <BarChartOutlined />, label: 'Surveys' },
        { key: 'more', icon: <RocketOutlined />, label: 'Coming Soon...', disabled: true },
      ]
    }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'account': return <AccountSettings />;
      case 'contest': return <ContestSection />;
      case 'quiz': return <QuizSection />;
      case 'survey': return <SurveySection />;
      default: return <AccountSettings />;
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: screens.md ? '24px' : '0' }}>
      
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{ marginBottom: 24, overflow: 'hidden', borderRadius: screens.md ? 12 : 0 }}
      >
        <div 
          style={{ 
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`, 
            padding: screens.md ? '48px' : '32px', 
            color: '#fff' 
          }}
        >
          <Row align="middle" gutter={24}>
            <Col flex="none">
              <Avatar 
                size={screens.md ? 96 : 64} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#fff', color: token.colorPrimary, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
            </Col>
            <Col flex="auto">
              <Title level={2} style={{ color: '#fff', margin: 0, fontSize: screens.md ? 30 : 24 }}>
                {currentUser?.username || 'Guest'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                Activity Dashboard
              </Text>
            </Col>
          </Row>
        </div>
      </Card>

      <Layout style={{ background: 'transparent' }}>
        
        {screens.md ? (
          <Sider width={280} style={{ background: 'transparent', marginRight: 24 }}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 12, height: '100%' }}
              bodyStyle={{ padding: '12px 0' }}
            >
              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={(e) => setSelectedKey(e.key)}
                items={menuItems}
                style={{ borderRight: 0 }}
              />
            </Card>
          </Sider>
        ) : (
          <div style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
             <Menu
                mode="horizontal"
                selectedKeys={[selectedKey]}
                onClick={(e) => setSelectedKey(e.key)}
                items={menuItems} 
                style={{ background: 'transparent', borderBottom: 0, minWidth: 400 }}
              />
          </div>
        )}

        <Content>
          <Card 
            bordered={false} 
            style={{ borderRadius: 12, minHeight: 600 }}
            bodyStyle={{ padding: screens.md ? 40 : 24 }}
          >
            {renderContent()}
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default ProfilePage;