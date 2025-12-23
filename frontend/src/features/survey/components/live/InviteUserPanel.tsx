import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Divider, 
  Button, 
  Tooltip, 
  AutoComplete, 
  Input,
  Tag,
  message, 
  Space, 
  List,
  theme
} from 'antd';
import { 
  CopyOutlined, 
  SendOutlined, 
  UserAddOutlined, 
  SearchOutlined
} from '@ant-design/icons';
import debounce from 'lodash/debounce'; 

import { surveyService } from '@/features/survey/api/surveyService';
import { userService } from '@/features/user/api/userService';
import type { UserSummary } from '@/features/user/model/types';

const { Title, Text, Paragraph } = Typography;

interface InviteUsersPanelProps {
    roomId: string;
}

interface AutoCompleteOption {
    value: string; 
    id: string;    
    user: UserSummary;
    label: React.ReactNode; 
}

export const InviteUsersPanel: React.FC<InviteUsersPanelProps> = ({ roomId }) => {
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();

    const [options, setOptions] = useState<AutoCompleteOption[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedUsers, setSelectedUsers] = useState<UserSummary[]>([]);
    const [generatedLinks, setGeneratedLinks] = useState<Record<string, string> | null>(null);
    const [isSending, setIsSending] = useState(false);

    const fetchUsers = useMemo(
        () =>
            debounce(async (input: string) => {
                if (!input) {
                    setOptions([]);
                    setIsSearching(false);
                    return;
                }

                try {
                    const results = await userService.searchUsers(input);
                    
                    const mappedOptions = results.map((u) => ({
                        value: u.username,
                        id: u.id,
                        user: u,
                        label: u.username, 
                    }));
                    setOptions(mappedOptions);
                } catch (e) {
                    setOptions([]);
                } finally {
                    setIsSearching(false);
                }
            }, 500),
        []
    );

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setIsSearching(true);
        fetchUsers(value);
    };

    const handleSelect = (value: string, option: AutoCompleteOption) => {
        if (selectedUsers.some(u => u.id === option.id)) {
            messageApi.warning('This user is already added.');
            setSearchValue(''); 
            return;
        }

        setSelectedUsers(prev => [...prev, option.user]);
        setSearchValue(''); 
        setOptions([]); 
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleSendInvites = async () => {
        if (selectedUsers.length === 0) return;

        const ids = selectedUsers.map(u => u.id);

        setIsSending(true);
        try {
            const tokensMap = await surveyService.generateInvites(roomId, ids);
            setGeneratedLinks(tokensMap);
            messageApi.success(`Invitations sent to ${ids.length} users!`);
            setSelectedUsers([]); 
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to send invitations.");
        } finally {
            setIsSending(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        messageApi.success("Link copied to clipboard!");
    };

    const joinBaseUrl = `${window.location.origin}/survey/join/${roomId}`;

    return (
        <>
            {contextHolder}
            <Card 
                style={{ marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                bodyStyle={{ padding: 24 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <UserAddOutlined style={{ fontSize: 20, marginRight: 8, color: token.colorTextSecondary }} />
                    <Title level={4} style={{ margin: 0 }}>Invite Users</Title>
                </div>
                
                <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                    Search for users by username to generate invitation tickets.
                </Paragraph>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                        <AutoComplete
                            options={options}
                            style={{ width: '100%' }}
                            onSearch={handleSearch}
                            onSelect={handleSelect}
                            value={searchValue}
                            notFoundContent={isSearching ? "Searching..." : null}
                            backfill={true}
                        >
                            <Input 
                                placeholder="Type username..." 
                                prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
                                allowClear
                            />
                        </AutoComplete>
                        
                        <Button 
                            type="primary" 
                            onClick={handleSendInvites}
                            loading={isSending}
                            disabled={selectedUsers.length === 0}
                            icon={<SendOutlined />}
                        >
                            Invite ({selectedUsers.length})
                        </Button>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div style={{ 
                            padding: 12, 
                            border: `1px dashed ${token.colorBorder}`, 
                            borderRadius: token.borderRadius,
                            background: token.colorFillAlter 
                        }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                                Selected recipients:
                            </Text>
                            <Space size={[0, 8]} wrap>
                                {selectedUsers.map(user => (
                                    <Tag 
                                        key={user.id} 
                                        closable 
                                        onClose={() => handleRemoveUser(user.id)}
                                        color="blue"
                                        style={{ display: 'flex', alignItems: 'center', fontSize: 14, padding: '4px 10px' }}
                                    >
                                        {user.username}
                                    </Tag>
                                ))}
                            </Space>
                        </div>
                    )}

                    {generatedLinks && (
                        <div style={{ marginTop: 16 }}>
                            <Divider orientation="left" style={{ margin: '12px 0' }}>
                                <Text type="secondary" style={{ fontSize: 13 }}>Invitation Links</Text>
                            </Divider>
                            
                            <List
                                size="small"
                                dataSource={Object.entries(generatedLinks)}
                                renderItem={([userId, tokenString]) => {
                                    const fullLink = `${joinBaseUrl}?ticket=${tokenString}`;
                                    
                                    return (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: token.colorFillSecondary,
                                            borderRadius: token.borderRadius,
                                            padding: '8px 12px',
                                            marginBottom: 8
                                        }}>
                                            <div style={{ overflow: 'hidden', marginRight: 16 }}>
                                                <Tag>User</Tag> 
                                                <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
                                                    {fullLink}
                                                </Text>
                                            </div>
                                            <Tooltip title="Copy link">
                                                <Button 
                                                    type="text" 
                                                    icon={<CopyOutlined />} 
                                                    onClick={() => copyToClipboard(fullLink)}
                                                    size="small"
                                                />
                                            </Tooltip>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    )}
                </Space>
            </Card>
        </>
    );
};