import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Button, Select, Spin, message, Tooltip, List } from 'antd';
import { UserAddOutlined, CopyOutlined, SendOutlined } from '@ant-design/icons';

import { quizService } from '../../api/quizService'; 
import { userService } from '@/features/user/api/userService';
import type { UserSummary } from '@/features/user/model/types';
import { useDebounce } from '@/shared/hooks/useDebounce';

const { Text } = Typography;
const { Option } = Select;

interface InviteUsersPanelProps {
    roomId: string;
}

export const InviteUsersPanel: React.FC<InviteUsersPanelProps> = ({ roomId }) => {
    const [options, setOptions] = useState<UserSummary[]>([]);
    const [fetching, setFetching] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [generatedLinks, setGeneratedLinks] = useState<Record<string, string> | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        let active = true;

        const fetchUsers = async () => {
            if (!debouncedSearch.trim()) {
                setOptions([]);
                return;
            }

            setFetching(true);
            try {
                const results = await userService.searchUsers(debouncedSearch);
                if (active) {
                    setOptions(results);
                }
            } catch (e) {
                if (active) {
                    setOptions([]);
                }
            } finally {
                if (active) {
                    setFetching(false);
                }
            }
        };

        fetchUsers();

        return () => {
            active = false;
        };
    }, [debouncedSearch]);

    const handleSendInvites = async () => {
        if (selectedUserIds.length === 0) return;

        setIsSending(true);
        try {
            const tokensMap = await quizService.generateInvites(roomId, selectedUserIds);
            
            setGeneratedLinks(tokensMap);
            messageApi.success(`Invites sent to ${selectedUserIds.length} users!`);
            setSelectedUserIds([]); 
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to send invites.");
        } finally {
            setIsSending(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        messageApi.success("Link copied!");
    };

    const joinBaseUrl = `${window.location.origin}/quiz/join/${roomId}`;

    return (
        <Card title={<span><UserAddOutlined /> Invite Users</span>} style={{ marginBottom: 24 }}>
            {contextHolder}
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Search users to send invitations and generate unique ticket links.
            </Text>

            <Select
                mode="multiple"
                placeholder="Search users..."
                filterOption={false}
                onSearch={setSearchTerm}
                onChange={setSelectedUserIds}
                value={selectedUserIds}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                style={{ width: '100%', marginBottom: 16 }}
                allowClear
                showSearch
            >
                {options.map((user) => (
                    <Option key={user.id} value={user.id}>
                        {user.username}
                    </Option>
                ))}
            </Select>

            <Button 
                type="primary"
                block
                onClick={handleSendInvites} 
                disabled={isSending || selectedUserIds.length === 0}
                icon={isSending ? <Spin size="small" /> : <SendOutlined />}
            >
                {isSending ? 'Sending...' : `Invite ${selectedUserIds.length} Users`}
            </Button>

            {generatedLinks && (
                <div style={{ marginTop: 24 }}>
                    <Divider orientation="left" style={{ fontSize: 14 }}>Generated Links</Divider>
                    
                    <List
                        size="small"
                        dataSource={Object.entries(generatedLinks)}
                        renderItem={([userId, token]) => {
                            const fullLink = `${joinBaseUrl}?ticket=${token}`;
                            return (
                                <List.Item
                                    actions={[
                                        <Tooltip title="Copy Link" key="copy">
                                            <Button 
                                                type="text" 
                                                icon={<CopyOutlined />} 
                                                onClick={() => copyToClipboard(fullLink)} 
                                            />
                                        </Tooltip>
                                    ]}
                                >
                                    <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>ID: {userId.substring(0, 5)}...</Text>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1890ff', fontSize: 12 }}>
                                            {fullLink}
                                        </div>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                </div>
            )}
        </Card>
    );
};