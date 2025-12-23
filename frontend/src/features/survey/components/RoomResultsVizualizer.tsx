import React, { useState } from 'react';
import { 
    Card, Typography, Row, Col, Divider, 
    Button, Alert, Empty 
} from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import type { FinalRoomResultDto, QuestionResultDto } from '../model/socket.types';
import type { QuestionType as RestQuestionType } from '../model/types';

const { Text } = Typography;
const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#fadb14'];

const OpenTextVisualizer: React.FC<{ answers: string[] }> = ({ answers }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!answers || answers.length === 0) {
        return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>No text answers submitted.</div>;
    }

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % answers.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + answers.length) % answers.length);

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ 
                background: '#fafafa', 
                padding: 24, 
                borderRadius: 8, 
                border: '1px solid #f0f0f0',
                minHeight: 100,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 16
            }}>
                <Text style={{ fontSize: 16, fontStyle: 'italic' }}>"{answers[currentIndex]}"</Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <Button icon={<LeftOutlined />} onClick={handlePrev} disabled={answers.length <= 1} />
                <Text type="secondary">{currentIndex + 1} of {answers.length}</Text>
                <Button icon={<RightOutlined />} onClick={handleNext} disabled={answers.length <= 1} />
            </div>
        </div>
    );
};

const QuestionVisualization: React.FC<{ result: QuestionResultDto }> = ({ result }) => {
    const questionType = result.type as RestQuestionType;
    if (questionType === 'OPEN_TEXT') return <OpenTextVisualizer answers={result.openAnswers || []} />;

    const counts = result.answerCounts || {};
    const chartData = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    if (chartData.length === 0) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>No votes recorded.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} height={60} tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

interface ResultsVisualizerProps {
    results: FinalRoomResultDto;
}

export const RoomResultsVisualizer: React.FC<ResultsVisualizerProps> = ({ results }) => {
    const displayResults = results.results || [];

    if (displayResults.length === 0) {
        return <Empty description="No results to display." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <Row gutter={[24, 24]}>
            {displayResults.map((result, index) => (
                <Col span={24} key={result.questionId}>
                    <Card 
                        title={`${index + 1}. ${result.title}`}
                        type="inner"
                        bordered={true}
                    >
                        <QuestionVisualization result={result} />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};