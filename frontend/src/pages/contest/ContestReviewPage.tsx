import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Button, Typography, Tabs, Row, Col, Modal, Spin, Empty, message 
} from 'antd';
import { 
    ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined 
} from '@ant-design/icons';

import { contestService } from '@/features/contest/api/contestService';
import type { SubmissionDto } from '@/features/contest/model/types';

import { ReviewSubmissionCard } from '@/features/contest/components/ReviewSubmissionCard';

const { Title } = Typography;

type TabStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

const ContestReviewPage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [activeStatus, setActiveStatus] = useState<TabStatus>('PENDING');
    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');

    const fetchSubmissions = async (status: TabStatus) => {
        setIsLoading(true);
        try {
            const response: any = await contestService.getSubmissionsForReview(contestId!, status);
            const list = Array.isArray(response) ? response : (response?.content || []);
            setSubmissions(list);
        } catch (e) {
            console.error(e);
            messageApi.error("Failed to load submissions.");
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) fetchSubmissions(activeStatus);
    }, [contestId, activeStatus]);

    const handleReview = async (subId: string, action: 'APPROVED' | 'REJECTED', comment: string) => {
        if (action === 'REJECTED' && !comment.trim()) {
            messageApi.warning("Comment is required when rejecting.");
            return;
        }

        try {
            await contestService.reviewSubmission(contestId!, subId, action, comment);
            messageApi.success(`Submission ${action.toLowerCase()}.`);
            
            setSubmissions(prev => prev.filter(s => s.id !== subId));
        } catch (e) {
            messageApi.error("Failed to submit review.");
        }
    };

    const handleOpenPreview = (url: string, title: string) => {
        setPreviewUrl(url);
        setPreviewTitle(title);
        setPreviewOpen(true);
    };

    const tabItems = [
        { key: 'PENDING', label: 'To Review', icon: <ClockCircleOutlined /> },
        { key: 'APPROVED', label: 'Approved', icon: <CheckCircleOutlined /> },
        { key: 'REJECTED', label: 'Rejected', icon: <CloseCircleOutlined /> },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            {contextHolder}
            
            <div style={{ marginBottom: 24 }}>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate(-1)} 
                    style={{ marginBottom: 16 }}
                >
                    Back to Contest
                </Button>
                <Title level={2} style={{ margin: 0 }}>Submission Review</Title>
            </div>

            <Tabs 
                activeKey={activeStatus} 
                onChange={(key) => setActiveStatus(key as TabStatus)}
                items={tabItems}
                destroyInactiveTabPane
                style={{ marginBottom: 24 }}
            />

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Spin size="large" tip="Loading..." />
                </div>
            ) : submissions.length === 0 ? (
                <Empty description={`No ${activeStatus.toLowerCase()} submissions found.`} />
            ) : (
                <Row gutter={[24, 24]}>
                    {submissions.map((sub) => (
                        <Col xs={24} md={12} lg={8} key={sub.id}>
                            <ReviewSubmissionCard 
                                submission={sub}
                                statusTab={activeStatus}
                                onApprove={(id, comm) => handleReview(id, 'APPROVED', comm)}
                                onReject={(id, comm) => handleReview(id, 'REJECTED', comm)}
                                onPreview={handleOpenPreview}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            <Modal
                open={previewOpen}
                title={`Submission by ${previewTitle}`}
                footer={null}
                onCancel={() => {
                    setPreviewOpen(false);
                    setPreviewUrl(null);
                }}
                width={900}
                centered
                bodyStyle={{ padding: 0, background: '#000', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {previewUrl && (
                    previewUrl.match(/\.(mp4|mov|webm)$/i) ? (
                        <video 
                            src={previewUrl} 
                            controls 
                            autoPlay 
                            style={{ maxWidth: '100%', maxHeight: '80vh' }} 
                        />
                    ) : (
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
                        />
                    )
                )}
            </Modal>
        </div>
    );
};

export default ContestReviewPage;