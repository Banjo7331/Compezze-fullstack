import React from 'react';
import { Card, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const ContestGenericStage: React.FC<{ name: string }> = ({ name }) => (
    <Card style={{ textAlign: 'center', backgroundColor: '#fafafa', padding: 40 }}>
        <InfoCircleOutlined style={{ fontSize: 60, color: '#8c8c8c', marginBottom: 16 }} />
        <Title level={3} style={{ marginBottom: 8 }}>{name}</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>Please wait...</Text>
    </Card>
);