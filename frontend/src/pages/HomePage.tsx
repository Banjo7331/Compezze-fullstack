import React from 'react';
import { Typography, Button, Card, Row, Col, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TrophyOutlined, FormOutlined, QuestionCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <Title level={1} style={{ color: '#fa8c16', marginBottom: 16 }}>
          Welcome to the Platform
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#8c8c8c', maxWidth: 600, margin: '0 auto' }}>
          Your central hub for managing contests, engaging in quizzes, and creating detailed surveys. 
          Start by choosing a module below.
        </Paragraph>
        <Space style={{ marginTop: 32 }}>
          <Button type="primary" size="large" onClick={() => navigate('/contest')}>
            Explore Contests
          </Button>
          <Button size="large" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            style={{ height: '100%', borderColor: '#ffe7ba' }}
            title={<Space><TrophyOutlined style={{ color: '#fa8c16' }} /> Contests</Space>}
          >
            <Paragraph>
              Participate in exciting contests or organize your own. Manage participants, review submissions, and announce winners.
            </Paragraph>
            <Button type="link" onClick={() => navigate('/contest/create')} style={{ paddingLeft: 0 }}>
              Create Contest <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            style={{ height: '100%', borderColor: '#ffe7ba' }}
            title={<Space><QuestionCircleOutlined style={{ color: '#fa8c16' }} /> Quizzes</Space>}
          >
            <Paragraph>
              Test knowledge with dynamic quizzes. Join a room to compete with others or create a challenge for your friends.
            </Paragraph>
            <Button type="link" onClick={() => navigate('/quiz/create')} style={{ paddingLeft: 0 }}>
              Create Quiz <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            style={{ height: '100%', borderColor: '#ffe7ba' }}
            title={<Space><FormOutlined style={{ color: '#fa8c16' }} /> Surveys</Space>}
          >
            <Paragraph>
              Gather feedback efficiently. Design custom surveys and analyze responses in real-time rooms.
            </Paragraph>
            <Button type="link" onClick={() => navigate('/survey/create')} style={{ paddingLeft: 0 }}>
              Create Survey <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;