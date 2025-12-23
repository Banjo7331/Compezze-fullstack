import React from 'react';
import { Typography, Row, Col, Card, Button } from 'antd';
import { PlusOutlined, BarChartOutlined, LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { ActiveRoomsList } from '@/features/survey/components/ActiveRoomList';
import { FeaturedFormsWidget } from '@/features/survey/components/FeaturedFormsWidget';

const { Title, Paragraph } = Typography;

const SurveyPage: React.FC = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <div style={{ margin: '32px 0', textAlign: 'center' }}>
                <Title level={1} style={{ marginBottom: 16, color: '#1890ff' }}>
                    <BarChartOutlined style={{ marginRight: 16 }} />
                    Survey Center
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 18 }}>
                    Create polls, collect feedback, and analyze results in real-time.
                </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={10} lg={9}>
                    <Card 
                        bordered={false}
                        hoverable
                        style={{ 
                            height: '100%', 
                            backgroundColor: '#e6f7ff',
                            borderRadius: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: 300,
                            border: '1px solid #bae7ff'
                        }}
                        bodyStyle={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: 32
                        }}
                    >
                        <PlusOutlined style={{ fontSize: 80, color: '#1890ff', marginBottom: 16 }} />
                        
                        <Title level={2} style={{ margin: '0 0 8px 0' }}>
                            New Survey
                        </Title>
                        
                        <Paragraph type="secondary" style={{ marginBottom: 24, fontSize: 16 }}>
                            Design a new form from scratch.
                        </Paragraph>

                        <Link to="/survey/create">
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<PlusOutlined />}
                                style={{
                                    backgroundColor: '#1890ff', 
                                    borderColor: '#bae7ff',
                                    height: 48,
                                    fontSize: 16,
                                    padding: '0 32px',
                                    borderRadius: 6
                                }}
                            >
                                START CREATOR
                            </Button>
                        </Link>
                    </Card>
                </Col>

                <Col xs={24} md={14} lg={15}>
                    <FeaturedFormsWidget />
                </Col>

                <Col span={24}>
                    <div style={{ marginTop: 48 }}>
                        <div style={{ 
                            borderBottom: '1px solid #f0f0f0', 
                            paddingBottom: 16, 
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <LoginOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                            <Title level={2} style={{ margin: 0 }}>
                                Active Rooms
                            </Title>
                        </div>
                        
                        <ActiveRoomsList />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default SurveyPage;