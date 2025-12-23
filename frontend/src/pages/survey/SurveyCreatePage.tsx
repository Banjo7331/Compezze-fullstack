import React from 'react';
import { Typography, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';

import { SurveyCreateForm } from '@/features/survey/components/SurveyCreateForm'; 

const { Content } = Layout;
const { Title } = Typography;

const SurveyCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/survey');
  };

  const handleFormCreated = () => {
    navigate('/survey'); 
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <Title level={2}>Create New Survey</Title>
            </div>
            
            <SurveyCreateForm 
                onCancel={handleCancel} 
                onSuccess={handleFormCreated}
            />
        </Content>
    </Layout>
  );
};

export default SurveyCreatePage;