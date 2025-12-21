import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Modal, Result, Popconfirm, theme } from 'antd';
import { CloudUploadOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { ContestSubmissionForm } from './ContestSubmissionForm';
import { contestService } from '@/features/contest/api/contestService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

const { Paragraph } = Typography;

interface ParticipantProps {
  contestId: string;
  status: string;
  isCompetitor: boolean;
  onRefresh: () => void;
  onOpenLobby: () => void;
}

export const ParticipantActionCard: React.FC<ParticipantProps> = ({
  contestId, status, isCompetitor, onRefresh, onOpenLobby
}) => {
  const { token } = theme.useToken();
  const { showSuccess, showError } = useSnackbar();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isActive = status === 'ACTIVE';
  const isSubmissionPhase = status === 'CREATED';

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await contestService.withdrawMySubmission(contestId);
      showSuccess("Submission withdrawn.");
      onRefresh();
    } catch (e) {
      showError("Failed to withdraw.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isActive) {
    return (
      <Card style={{ textAlign: 'center', borderColor: token.colorSuccess, backgroundColor: '#f6ffed' }}>
        <Result
          status="success"
          title="Contest is LIVE!"
          subTitle="The event has started. Join the transmission now."
          extra={[
            <Button 
              type="primary" 
              size="large" 
              key="join"
              icon={<PlayCircleOutlined />} 
              onClick={onOpenLobby}
              style={{ background: token.colorSuccess, borderColor: token.colorSuccess }}
            >
              JOIN LIVE ROOM
            </Button>
          ]}
        />
      </Card>
    );
  }

  if (isCompetitor) {
    return (
      <Card title="My Submission Status" style={{ borderColor: token.colorBorderSecondary }}>
        <Alert 
          message="Submission Received" 
          description="Good luck! Wait for the verification results." 
          type="success" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
        {isSubmissionPhase && (
          <Popconfirm 
            title="Withdraw submission?" 
            description="This action cannot be undone."
            onConfirm={handleWithdraw}
            okText="Yes, withdraw"
          >
            <Button danger icon={<DeleteOutlined />} loading={isWithdrawing}>
              Withdraw Submission
            </Button>
          </Popconfirm>
        )}
      </Card>
    );
  }

  return (
    <Card 
      title="Participation Zone" 
      style={{ borderColor: token.colorPrimaryBorder, backgroundColor: token.colorBgContainer }}
    >
      {isSubmissionPhase ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Paragraph>Submissions are open. Upload your work to compete.</Paragraph>
          <Button 
            type="primary" 
            size="large" 
            icon={<CloudUploadOutlined />} 
            onClick={() => setIsModalOpen(true)}
          >
            Submit Entry
          </Button>
        </div>
      ) : (
        <Alert message="Waiting for next phase" type="info" showIcon />
      )}

      <Modal 
        title="Submit your entry" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <ContestSubmissionForm 
          contestId={contestId} 
          onSuccess={() => { setIsModalOpen(false); onRefresh(); }} 
        />
      </Modal>
    </Card>
  );
};