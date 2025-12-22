import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { QuizCreateForm } from '@/features/quiz/components/QuizCreateForm';

const { Content } = Layout;
const { Title } = Typography;

const QuizCreatePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ padding: '24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                    <Title level={2}>Create New Quiz</Title>
                </div>
                
                <QuizCreateForm 
                    onCancel={() => navigate('/quiz')} 
                    onSuccess={() => navigate('/quiz')} 
                />
            </Content>
        </Layout>
    );
};

export default QuizCreatePage;