import React, { useState } from 'react';
import { 
    Card, Typography, Alert, Button, Space, Modal 
} from 'antd';
import { CloseOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { surveyService } from '@/features/survey/api/surveyService';
import { useSurveyRoomSocket } from '@/features/survey/hooks/useSurveyRoomSocket';

const { Text, Title } = Typography;

interface RoomControlPanelProps {
    roomId: string;
    onCloseSuccess: () => void; 
}

export const RoomControlPanel: React.FC<RoomControlPanelProps> = ({ roomId, onCloseSuccess }) => {
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);
    
    const { isRoomOpen } = useSurveyRoomSocket(roomId); 

    const handleCloseRoom = () => {
        Modal.confirm({
            title: "Close Room?",
            content: "Are you sure you want to close this room? No more submissions will be accepted.",
            okType: 'danger',
            onOk: async () => {
                setIsClosing(true);
                try {
                    await surveyService.closeRoom(roomId);
                    onCloseSuccess();
                } catch (error) {
                    console.error(error);
                    Modal.error({ title: "Failed to close room" });
                } finally {
                    setIsClosing(false);
                }
            }
        });
    };

    return (
        <Card title={<span><SafetyCertificateOutlined /> Room Controls</span>}>
            
            <Alert 
                message="Current Status" 
                description={
                    <Text strong style={{ color: isRoomOpen ? '#52c41a' : '#fa8c16' }}>
                        {isRoomOpen ? "OPEN (Accepting answers)" : "CLOSED"}
                    </Text>
                }
                type={isRoomOpen ? "success" : "warning"}
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={handleCloseRoom}
                    loading={isClosing}
                    disabled={!isRoomOpen}
                >
                    Close Room
                </Button>
                
                <Button
                    block
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/survey')}
                    disabled={isClosing}
                >
                    Back to Forms
                </Button>
            </Space>
            
            {!isRoomOpen && (
                 <Alert 
                    message="Room is closed" 
                    description="Final results are displayed below." 
                    type="info" 
                    showIcon 
                    style={{ marginTop: 24 }} 
                />
            )}
        </Card>
    );
};