import React from 'react';
import { Card, Button, Typography, Space, Alert, theme } from 'antd';
import { SettingOutlined, AuditOutlined, PlayCircleOutlined, LockOutlined } from '@ant-design/icons';

interface StaffProps {
  onManage: () => void;
  onReview: () => void;
  onCloseSubmissions?: () => void;
  onOpenLobby: () => void;
  isProcessing: boolean;
  status: string;
}

export const StaffActionCard: React.FC<StaffProps> = ({
  onManage, onReview, onCloseSubmissions, onOpenLobby, isProcessing, status
}) => {
  const { token } = theme.useToken();
  const isSubmissionPhase = status === 'CREATED';
  const isContestActive = status === 'ACTIVE';

  return (
    <Card 
      title={<Space><SettingOutlined style={{ color: token.colorPrimary }} /> Staff Control Panel</Space>}
      style={{ borderColor: token.colorPrimary, marginBottom: 24, background: '#fffcf0' }}
    >
      <Space wrap size="middle">
        <Button onClick={onManage} disabled={isProcessing}>
          Settings & Participants
        </Button>

        <Button icon={<AuditOutlined />} onClick={onReview}>
          Review Submissions
        </Button>

        {isSubmissionPhase && onCloseSubmissions && (
          <Button 
            danger 
            icon={<LockOutlined />} 
            onClick={onCloseSubmissions} 
            loading={isProcessing}
          >
            Close Submissions
          </Button>
        )}

        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />} 
          onClick={onOpenLobby}
          loading={isProcessing}
          style={{ backgroundColor: isContestActive ? token.colorSuccess : token.colorPrimary }}
        >
          {isContestActive ? "Go to Live Console" : "Open Lobby / Start"}
        </Button>
      </Space>

      {status === 'DRAFT' && (
        <Alert 
          message="Verification Phase" 
          description="Submissions are closed. Review phase is active." 
          type="warning" 
          showIcon 
          style={{ marginTop: 16 }} 
        />
      )}
    </Card>
  );
};