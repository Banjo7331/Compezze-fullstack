import React, { useState } from 'react';
import { Card, Button, Input, Tag, Typography, Tooltip } from 'antd';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    PlayCircleOutlined,
    FileTextOutlined,
    PaperClipOutlined
} from '@ant-design/icons';
import type { SubmissionDto } from '@/features/contest/model/types';

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
    submission: SubmissionDto;
    statusTab: 'PENDING' | 'APPROVED' | 'REJECTED';
    onApprove: (id: string, comment: string) => void;
    onReject: (id: string, comment: string) => void;
    onPreview: (url: string, title: string) => void;
}

export const ReviewSubmissionCard: React.FC<Props> = ({ 
    submission, statusTab, onApprove, onReject, onPreview 
}) => {
    const [draftComment, setDraftComment] = useState('');

    const displayUrl = submission.mediaUrl || submission.contentUrl;
    const isVideo = displayUrl?.match(/\.(mp4|mov|webm)$/i);

    const actions: React.ReactNode[] = [];

    if (statusTab === 'PENDING') {
        actions.push(
            <Button 
                key="reject" type="text" danger icon={<CloseCircleOutlined />} 
                onClick={() => onReject(submission.id, draftComment)}
            >
                Reject
            </Button>,
            <Button 
                key="approve" type="text" style={{ color: '#52c41a' }} icon={<CheckCircleOutlined />} 
                onClick={() => onApprove(submission.id, draftComment)}
            >
                Approve
            </Button>
        );
    } else {
        actions.push(
            <Tag key="status" color={statusTab === 'APPROVED' ? 'success' : 'error'}>
                {statusTab}
            </Tag>
        );
    }

    return (
        <Card
            hoverable
            actions={actions}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong ellipsis style={{ maxWidth: 180 }}>{submission.participantName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(submission.createdAt).toLocaleDateString()}
                    </Text>
                </div>
            }
            cover={
                <div 
                    onClick={() => displayUrl && onPreview(displayUrl, submission.participantName)}
                    style={{ 
                        height: 200, 
                        background: '#f0f2f5', 
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundImage: (displayUrl && !isVideo) ? `url(${displayUrl})` : undefined,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        cursor: displayUrl ? 'pointer' : 'default'
                    }}
                >
                    {displayUrl ? (
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: 10, display: 'flex' }}>
                            <PlayCircleOutlined style={{ fontSize: 40, color: '#fff' }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999' }}>
                            <FileTextOutlined style={{ fontSize: 30 }} />
                            <div>No Preview</div>
                        </div>
                    )}
                </div>
            }
        >
            {submission.originalFilename && (
                <div style={{ marginBottom: 12, fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PaperClipOutlined /> {submission.originalFilename}
                </div>
            )}

            {submission.comment && (
                <div style={{ marginBottom: 16, background: '#fafafa', padding: 8, borderRadius: 4, fontSize: 13 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>User comment:</Text>
                    <div>"{submission.comment}"</div>
                </div>
            )}
            
            {statusTab === 'PENDING' && (
                <TextArea 
                    placeholder="Admin review note (required for reject)..." 
                    rows={2}
                    value={draftComment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    style={{ fontSize: 13 }}
                />
            )}
        </Card>
    );
};