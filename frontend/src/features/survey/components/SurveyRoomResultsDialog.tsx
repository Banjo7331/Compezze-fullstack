import React, { useEffect, useState } from 'react';
import { Modal, Typography, Spin, Alert, Button, Space, Tag } from 'antd';
import { BarChartOutlined, UserOutlined } from '@ant-design/icons';
import { surveyService } from '../api/surveyService';
import type { SurveyRoomDetailsResponse } from '../model/types';
import { RoomResultsVisualizer } from './RoomResultsVizualizer';

const { Text } = Typography;

interface SurveyResultsDialogProps {
    roomId: string | null;
    open: boolean;
    onClose: () => void;
}

export const SurveyRoomResultsDialog: React.FC<SurveyResultsDialogProps> = ({ roomId, open, onClose }) => {
    const [data, setData] = useState<SurveyRoomDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && roomId) {
            const loadResults = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const details = await surveyService.getRoomDetails(roomId);
                    setData(details);
                } catch (err) {
                    setError("Failed to load results.");
                } finally {
                    setIsLoading(false);
                }
            };
            loadResults();
        }
    }, [open, roomId]);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChartOutlined style={{ color: '#1890ff' }} />
                    <span>Session Results</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
            width={800}
            centered
            bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: 24 }}
        >
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert message="Error" description={error} type="error" showIcon />
            ) : data && data.currentResults ? (
                <div>
                    <div style={{ marginBottom: 24, textAlign: 'center' }}>
                        <Text strong style={{ fontSize: 16 }}>{data.surveyTitle}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Space>
                                <Tag icon={<UserOutlined />}>
                                    {data.currentParticipants} participants
                                </Tag>
                            </Space>
                        </div>
                    </div>
                    
                    <RoomResultsVisualizer results={data.currentResults} />
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    No data available.
                </div>
            )}
        </Modal>
    );
};