import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Table, Tag, Button, Input, Typography, 
    Space, Modal, Checkbox, Popconfirm, message, Tooltip 
} from 'antd';
import { 
    ArrowLeftOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined,
    UserOutlined
} from '@ant-design/icons';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestParticipantDto, ContestRole } from '@/features/contest/model/types';

const { Title, Text } = Typography;

interface ManagerModalProps {
    open: boolean;
    onClose: () => void;
    participant: ContestParticipantDto | null;
    isProcessing: boolean;
    onToggleRole: (role: ContestRole, hasRole: boolean) => void;
    onDeleteSubmission: (submissionId: string) => void;
}

const ParticipantManagerModal: React.FC<ManagerModalProps> = ({
    open, onClose, participant, isProcessing, onToggleRole, onDeleteSubmission
}) => {
    if (!participant) return null;

    const availableRoles: ContestRole[] = ['COMPETITOR', 'JURY', 'MODERATOR'];

    return (
        <Modal
            title={`Manage: ${participant.displayName}`}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
        >
            <div style={{ marginBottom: 24 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Roles & Permissions</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {availableRoles.map(role => {
                        const hasRole = participant.roles.includes(role);
                        return (
                            <Checkbox
                                key={role}
                                checked={hasRole}
                                disabled={isProcessing}
                                onChange={() => onToggleRole(role, hasRole)}
                            >
                                {role}
                            </Checkbox>
                        );
                    })}
                </div>
            </div>

            {participant.submissionId && (
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Submission Management</Text>
                    <Popconfirm
                        title="Delete submission"
                        description="Are you sure you want to delete this submission? This action cannot be undone."
                        onConfirm={() => onDeleteSubmission(participant.submissionId!)}
                        okText="Yes, Delete"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: isProcessing }}
                    >
                        <Button danger icon={<DeleteOutlined />} loading={isProcessing}>
                            Reject & Delete Submission
                        </Button>
                    </Popconfirm>
                </div>
            )}
        </Modal>
    );
};

const ContestManagePage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState<ContestParticipantDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [selectedUser, setSelectedUser] = useState<ContestParticipantDto | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!debouncedQuery.trim()) {
                setParticipants([]);
                return;
            }

            setIsLoading(true);
            try {
                const data = await contestService.getParticipants(contestId!, debouncedQuery);
                setParticipants(data.slice(0, 10));
            } catch (e) {
                console.error(e);
                message.error("Failed to search participants.");
            } finally {
                setIsLoading(false);
            }
        };

        if (contestId) fetchParticipants();
    }, [debouncedQuery, contestId]);


    const handleToggleRole = async (role: ContestRole, hasRole: boolean) => {
        if (!selectedUser) return;
        setIsProcessing(true);
        try {
            await contestService.manageRole(contestId!, selectedUser.userId, role, !hasRole);
            message.success(`Role ${role} updated.`);
            
            if (debouncedQuery) {
                const updatedList = await contestService.getParticipants(contestId!, debouncedQuery);
                setParticipants(updatedList.slice(0, 10));
                
                const updatedUser = updatedList.find(u => u.id === selectedUser.id);
                if(updatedUser) setSelectedUser(updatedUser);
            }
        } catch (e) {
            message.error("Failed to update role.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteSubmission = async (submissionId: string) => {
        if (!selectedUser) return;
        setIsProcessing(true);
        try {
            await contestService.deleteSubmission(contestId!, submissionId);
            message.success("Submission rejected.");
            
            if (debouncedQuery) {
                const updatedList = await contestService.getParticipants(contestId!, debouncedQuery);
                setParticipants(updatedList.slice(0, 10));
                
                const updatedUser = updatedList.find(u => u.id === selectedUser.id);
                if(updatedUser) setSelectedUser(updatedUser);
            }
        } catch (e) {
            message.error("Failed to delete submission.");
        } finally {
            setIsProcessing(false);
        }
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'displayName',
            key: 'displayName',
            render: (text: string, record: ContestParticipantDto) => (
                <Space>
                    <Text strong>{text}</Text>
                    {record.submissionId && (
                        <Tooltip title="User has a submission">
                            <Tag color="blue">Submission</Tag>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles: ContestRole[]) => (
                <>
                    {roles.length > 0 ? roles.map(role => {
                        let color = 'default';
                        if (role === 'MODERATOR') color = 'purple';
                        if (role === 'JURY') color = 'gold';
                        if (role === 'COMPETITOR') color = 'cyan';
                        return (
                            <Tag color={color} key={role}>
                                {role}
                            </Tag>
                        );
                    }) : <Text type="secondary" style={{ fontSize: 12 }}>No roles</Text>}
                </>
            ),
        },
        {
            title: 'Actions',
            key: 'action',
            align: 'right' as const,
            render: (_: any, record: ContestParticipantDto) => (
                <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => setSelectedUser(record)}
                >
                    Manage
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)} 
                style={{ marginBottom: 16 }}
            >
                Back
            </Button>
            
            <Card 
                title={<Title level={4} style={{ margin: 0 }}>Participant Management</Title>}
                bordered={false}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
                <div style={{ marginBottom: 24 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                        Search for a user by name to manage their permissions or submissions.
                    </Text>
                    <Input 
                        size="large"
                        placeholder="Search participant by name..." 
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={participants}
                    rowKey="id"
                    loading={isLoading}
                    pagination={false}
                    locale={{
                        emptyText: searchQuery 
                            ? "No participants found matching your query." 
                            : "Start typing to search..."
                    }}
                />
            </Card>

            <ParticipantManagerModal 
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                participant={selectedUser}
                isProcessing={isProcessing}
                onToggleRole={handleToggleRole}
                onDeleteSubmission={handleDeleteSubmission}
            />
        </div>
    );
};

export default ContestManagePage;