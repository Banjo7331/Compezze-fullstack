import React from 'react';
import { 
    Modal, Button, Typography, Tag, Divider, 
    Space, Card, Popconfirm, Empty, Alert 
} from 'antd';
import { 
    SafetyCertificateOutlined,
    AuditOutlined,
    TrophyOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import type { ContestParticipantDto, ContestRole } from '../model/types';

const { Text, Title } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
    participant: ContestParticipantDto | null;
    onToggleRole: (role: ContestRole, hasRole: boolean) => void;
    onDeleteSubmission: (submissionId: string) => void;
    isProcessing: boolean;
}

const ROLES_CONFIG: { 
    role: ContestRole, 
    label: string, 
    icon: React.ReactElement, 
    color: string 
}[] = [
    { role: 'MODERATOR', label: 'Moderator', icon: <SafetyCertificateOutlined />, color: 'purple' },
    { role: 'JURY', label: 'Jury', icon: <AuditOutlined />, color: 'gold' },
    { role: 'COMPETITOR', label: 'Competitor', icon: <TrophyOutlined />, color: 'cyan' }, 
];

export const ContestParticipantManagerDialog: React.FC<Props> = ({ 
    open, onClose, participant, onToggleRole, onDeleteSubmission, isProcessing 
}) => {
    
    if (!participant) return null;

    const renderSubmissionStatus = (status: string) => {
        let color = 'default';
        let icon = <ClockCircleOutlined />;
        
        if (status === 'APPROVED') { color = 'success'; icon = <CheckCircleOutlined />; }
        if (status === 'REJECTED') { color = 'error'; icon = <CloseCircleOutlined />; }

        return <Tag icon={icon} color={color}>{status}</Tag>;
    };

    return (
        <Modal
            title={
                <div>
                    Manage Participant
                    <div style={{ fontWeight: 'normal', fontSize: '14px', color: '#888' }}>
                        {participant.displayName}
                    </div>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
            width={400}
            centered
        >
            <Divider orientation="left" style={{ margin: '12px 0' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>ROLES & PERMISSIONS</Text>
            </Divider>

            <Space size={[8, 8]} wrap style={{ width: '100%', marginBottom: 16 }}>
                {ROLES_CONFIG.map((config) => {
                    const hasRole = participant.roles.includes(config.role);
                    const isCompetitor = config.role === 'COMPETITOR';

                    return (
                        <Tag.CheckableTag
                            key={config.role}
                            checked={hasRole}
                            onChange={() => !isCompetitor && onToggleRole(config.role, hasRole)}
                            style={{ 
                                cursor: isCompetitor ? 'not-allowed' : 'pointer',
                                padding: '4px 12px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: hasRole ? `1px solid transparent` : '1px solid #d9d9d9',
                                background: hasRole ? undefined : '#fafafa',
                            }}
                        >
                            {config.icon}
                            {config.label}
                        </Tag.CheckableTag>
                    );
                })}
            </Space>

            <Divider orientation="left" style={{ margin: '12px 0' }}>
                 <Text type="secondary" style={{ fontSize: '12px' }}>CONTEST SUBMISSION</Text>
            </Divider>

            {participant.submissionId ? (
                <Card 
                    size="small" 
                    type="inner" 
                    bordered={true}
                    style={{ background: '#fafafa' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text strong>Status:</Text>
                        {renderSubmissionStatus(participant.submissionStatus || 'PENDING')}
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Submission ID: {participant.submissionId}</Text>
                    </div>

                    <Popconfirm
                        title="Reject & Delete Submission"
                        description={
                            <div style={{ maxWidth: 250 }}>
                                Are you sure? This will remove the submission permanently and revoke the <b>Competitor</b> role.
                            </div>
                        }
                        onConfirm={() => onDeleteSubmission(participant.submissionId!)}
                        okText="Yes, Delete"
                        okButtonProps={{ danger: true, loading: isProcessing }}
                        cancelText="Cancel"
                        disabled={isProcessing}
                    >
                        <Button 
                            danger 
                            block 
                            icon={<DeleteOutlined />}
                            loading={isProcessing}
                        >
                            Reject & Delete Submission
                        </Button>
                    </Popconfirm>
                </Card>
            ) : (
                <Alert 
                    message="No Submission" 
                    description="This user has not submitted an entry yet." 
                    type="info" 
                    showIcon 
                />
            )}
        </Modal>
    );
};