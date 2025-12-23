import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, Button, Typography, Space } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StartRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (config: { duration: number, maxParticipants: number }) => void;
    isLoading?: boolean;
}

interface FormValues {
    duration: number;
    maxParticipants: number;
}

export const StartSurveyRoomDialog: React.FC<StartRoomDialogProps> = ({ 
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
                    <span>Start New Session</span>
                </Space>
            }
            open={open}
            onCancel={!isLoading ? onClose : undefined}
            onOk={handleOk}
            confirmLoading={isLoading}
            okText="Launch Session"
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
                    Configure room parameters. The session will be active for the specified duration.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    duration: 15,
                    maxParticipants: 100
                }}
            >
                <Form.Item
                    name="duration"
                    label="Duration (minutes)"
                    tooltip="How long the survey will be accepting responses?"
                    rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 1, message: 'Min 1 minute' },
                        { type: 'number', max: 90, message: 'Max 90 minutes' }
                    ]}
                >
                    <InputNumber 
                        style={{ width: '100%' }} 
                        addonBefore={<ClockCircleOutlined />}
                        min={1} 
                        max={90} 
                    />
                </Form.Item>

                <Form.Item
                    name="maxParticipants"
                    label="Participant Limit"
                    rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 1, message: 'Min 1 participant' },
                        { type: 'number', max: 1000, message: 'Max 1000 participants' }
                    ]}
                >
                    <InputNumber 
                        style={{ width: '100%' }} 
                        addonBefore={<TeamOutlined />}
                        min={1} 
                        max={1000} 
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};