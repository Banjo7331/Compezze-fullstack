import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, Button, Typography, Space } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StartQuizRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (config: { maxParticipants: number, timePerQuestion: number }) => void;
    isLoading?: boolean;
}

interface FormValues {
    maxParticipants: number;
    timePerQuestion: number;
}

export const StartQuizRoomDialog: React.FC<StartQuizRoomDialogProps> = ({ 
    open, onClose, onConfirm, isLoading 
}) => {
    const [form] = Form.useForm<FormValues>();

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                onConfirm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={
                <Space>
                    <PlayCircleOutlined style={{ color: '#52c41a' }} />
                    <span>Start Game</span>
                </Space>
            }
            open={open}
            onCancel={!isLoading ? onClose : undefined}
            onOk={handleOk}
            confirmLoading={isLoading}
            okText="Create Lobby"
            okButtonProps={{ 
                type: 'primary', 
                style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
            }}
            cancelText="Cancel"
            width={500}
            centered
        >
            <div style={{ marginBottom: 24 }}>
                <Text type="secondary">
                    Configure game parameters before starting the lobby.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    timePerQuestion: 30,
                    maxParticipants: 100
                }}
            >
                <Form.Item
                    name="timePerQuestion"
                    label="Time per Question (seconds)"
                    tooltip="How much time players have to answer?"
                    rules={[
                        { required: true, message: 'This field is required' },
                        { type: 'number', min: 5, message: 'Min 5 seconds' },
                        { type: 'number', max: 300, message: 'Max 300 seconds (5 min)' }
                    ]}
                >
                    <InputNumber 
                        style={{ width: '100%' }} 
                        addonBefore={<ClockCircleOutlined />}
                        min={5} 
                        max={300} 
                    />
                </Form.Item>

                <Form.Item
                    name="maxParticipants"
                    label="Player Limit"
                    rules={[
                        { required: true, message: 'This field is required' },
                        { type: 'number', min: 2, message: 'Min 2 players' },
                        { type: 'number', max: 1000, message: 'Max 1000 players' }
                    ]}
                >
                    <InputNumber 
                        style={{ width: '100%' }} 
                        addonBefore={<TeamOutlined />}
                        min={2} 
                        max={1000} 
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};