import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Button, Row, Col, Alert } from 'antd';
import { StopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OptionDto {
    id: number;
    text: string;
}

interface GameQuestion {
    questionIndex: number;
    title: string;
    options: OptionDto[]; 
    timeLimitSeconds: number;
    endTime: number;
}

interface QuizGameViewProps {
    question: GameQuestion;
    isHost: boolean;
    onSubmitAnswer: (optionId: number) => void;
    onFinishEarly?: () => void;
}

export const QuizGameView: React.FC<QuizGameViewProps> = ({ question, isHost, onSubmitAnswer, onFinishEarly }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((question.endTime - now) / 1000));
            setTimeLeft(diff);
        }, 200);
        return () => clearInterval(interval);
    }, [question]);

    const handleAnswer = (optId: number) => {
        if (isHost) return;
        setSelectedOptionId(optId);
        onSubmitAnswer(optId);
    };

    const percent = Math.min(100, Math.max(0, (timeLeft / question.timeLimitSeconds) * 100));
    const isUrgent = timeLeft < 5;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <Text type="secondary" strong>QUESTION {question.questionIndex + 1}</Text>
                <div style={{ marginTop: 8 }}>
                    <Progress 
                        percent={percent} 
                        showInfo={false} 
                        strokeColor={isUrgent ? '#ff4d4f' : '#1890ff'}
                        status="active"
                    />
                </div>
                <Title level={4} style={{ marginTop: 8, color: isUrgent ? '#ff4d4f' : undefined }}>
                    {timeLeft}s
                </Title>
            </div>

            <Card style={{ marginBottom: 32, textAlign: 'center', background: '#fafafa' }} bordered={false}>
                <Title level={2} style={{ margin: 0 }}>{question.title}</Title>
            </Card>

            <Row gutter={[16, 16]}>
                {question.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                        <Col xs={24} md={12} key={opt.id}>
                            <Button 
                                block 
                                size="large"
                                onClick={() => handleAnswer(opt.id)}
                                disabled={selectedOptionId !== null || isHost || timeLeft === 0}
                                style={{ 
                                    height: 100, 
                                    fontSize: 18, 
                                    whiteSpace: 'normal',
                                    backgroundColor: isSelected ? '#1890ff' : '#fff',
                                    color: isSelected ? '#fff' : undefined,
                                    borderColor: isSelected ? '#1890ff' : '#d9d9d9',
                                    fontWeight: isSelected ? 'bold' : 'normal'
                                }}
                            >
                                {opt.text}
                            </Button>
                        </Col>
                    );
                })}
            </Row>

            {isHost && (
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <Alert message="Host View: You cannot answer." type="info" showIcon style={{ display: 'inline-flex', marginBottom: 16 }} />
                    <br />
                    <Button 
                        danger 
                        size="large"
                        icon={<StopOutlined />}
                        onClick={onFinishEarly}
                    >
                        Finish Question Early
                    </Button>
                </div>
            )}
        </div>
    );
};