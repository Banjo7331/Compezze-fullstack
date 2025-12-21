import React from 'react';
import { Card, Button, Typography, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface GuestProps {
  onJoin: () => void;
  isProcessing: boolean;
  isFull: boolean;
  isClosed: boolean;
}

export const GuestActionCard: React.FC<GuestProps> = ({ onJoin, isProcessing, isFull, isClosed }) => {
  const { token } = theme.useToken();
  
  return (
    <Card 
      hoverable 
      style={{ textAlign: 'center', borderColor: token.colorWarning, borderWidth: 2 }}
    >
      <div style={{ padding: 24 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Join the Competition
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 16 }}>
          Test your skills against others. Click below to register as a participant.
        </Typography.Paragraph>
        
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={onJoin} 
          loading={isProcessing}
          disabled={isFull || isClosed}
          style={{ height: 48, paddingLeft: 32, paddingRight: 32, fontSize: 18 }}
        >
          {isClosed ? 'Registration Closed' : isFull ? 'Full Capacity' : 'Register Now'}
        </Button>
      </div>
    </Card>
  );
};