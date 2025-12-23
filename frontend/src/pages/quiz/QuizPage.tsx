import React from 'react';
import { Typography, Row, Col, Card, Button } from 'antd';
import { 
    PlusOutlined, 
    TrophyOutlined, 
    RocketOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { QuizActiveRoomsList } from '@/features/quiz/components/QuizActiveRoomList';
import { QuizFeaturedTemplatesWidget } from '@/features/quiz/components/QuizFeaturedTemplatesWidget';

const { Title, Text, Paragraph } = Typography;

const QuizPage: React.FC = () => {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ margin: '32px 0' }}>
                
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <Title level={1} style={{ marginBottom: 8, color: '#1a9b0eff' }}>
                        <TrophyOutlined style={{ fontSize: 48, verticalAlign: 'middle', marginRight: 16 }} />
                        Quiz Center
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 18 }}>
                        Compete live, earn points, and win!
                    </Paragraph>
                </div>

                <Row gutter={[32, 32]}>
                    
                    <Col xs={24} md={10} lg={9}>
                        <Card 
                            bordered={false}
                            hoverable
                            style={{ 
                                height: '100%', 
                                backgroundColor: '#c0fc9eff',
                                borderRadius: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                minHeight: 300,
                                border: '1px solid #ffd591'
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
                            <PlusOutlined style={{ fontSize: 80, color: '#1a9b0eff', marginBottom: 16 }} />
                            
                            <Title level={2} style={{ margin: '0 0 8px 0' }}>
                                New Quiz
                            </Title>
                            
                            <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
                                Create a game with timed questions and points.
                            </Text>

                            <Link to="/quiz/create">
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<PlusOutlined />}
                                    style={{ 
                                        backgroundColor: '#1a9b0eff', 
                                        borderColor: '#c0fc9eff',
                                        height: 48,
                                        fontSize: 16,
                                        padding: '0 32px'
                                    }}
                                >
                                    QUIZ CREATOR
                                </Button>
                            </Link>
                        </Card>
                    </Col>

                    <Col xs={24} md={14} lg={15}>
                        <QuizFeaturedTemplatesWidget />
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
                                <RocketOutlined style={{ fontSize: 32, color: '#1a9b0eff' }} />
                                <Title level={2} style={{ margin: 0 }}>
                                    Active Lobbies
                                </Title>
                            </div>
                            
                            <QuizActiveRoomsList />
                        </div>
                    </Col>

                </Row>
            </div>
        </div>
    );
};

export default QuizPage;