import React, { useState } from 'react';
import { 
    Card, Form, Input, Button, Switch, Select, 
    Divider, Typography, Row, Col, 
    Popconfirm, message, Collapse, Space 
} from 'antd';
import { 
    PlusOutlined, 
    SaveOutlined, 
    ArrowLeftOutlined, 
    DeleteOutlined, 
    MinusCircleOutlined,
    SettingOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';

import { surveyService } from '../api/surveyService'; 
import { QuestionTypeValues } from '../model/types';
import type { CreateSurveyFormRequest } from '../model/types';

const { Text } = Typography;
const { Option } = Select;

interface SurveyCreateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

const DEFAULT_QUESTION = {
    title: '',
    type: QuestionTypeValues.SINGLE_CHOICE,
    possibleChoices: ['Option 1', 'Option 2']
};

export const SurveyCreateForm: React.FC<SurveyCreateFormProps> = ({ onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    
    const [activeKey, setActiveKey] = useState<string | string[]>(['0']);

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        try {
            const questions = values.questions.map((q: any) => ({
                ...q,
                possibleChoices: q.type === QuestionTypeValues.OPEN_TEXT 
                    ? [] 
                    : q.possibleChoices.filter((c: string) => c && c.trim().length > 0)
            }));

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (q.type !== QuestionTypeValues.OPEN_TEXT && q.possibleChoices.length < 2) {
                    messageApi.error(`Question #${i + 1} must have at least 2 options.`);
                    setActiveKey(String(i));
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload: CreateSurveyFormRequest = {
                title: values.title,
                isPrivate: values.isPrivate || false,
                questions: questions
            };

            await surveyService.createSurveyForm(payload);
            messageApi.success("Survey created successfully!");
            onSuccess();
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to create survey.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const genExtra = (removeFn: (index: number | number[]) => void, name: number, length: number) => (
        <Popconfirm 
            title="Delete question?" 
            onConfirm={(e) => {
                e?.stopPropagation();
                removeFn(name);
            }}
            onCancel={(e) => e?.stopPropagation()}
        >
            <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                disabled={length <= 1}
                onClick={(e) => e.stopPropagation()} 
            />
        </Popconfirm>
    );

    return (
        <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    title: '',
                    isPrivate: false,
                    questions: [DEFAULT_QUESTION]
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        <Form.Item
                            name="title"
                            label="Survey Title"
                            rules={[
                                { required: true, message: 'Please enter a title' },
                                { min: 8, message: 'Min 8 characters' },
                                { max: 20, message: 'Max 20 characters' }
                            ]}
                        >
                            <Input placeholder="e.g. Employee Satisfaction Survey" size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="isPrivate" label="Visibility" valuePropName="checked">
                            <Switch checkedChildren="Private" unCheckedChildren="Public" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Questions</Divider>

                <Form.List name="questions">
                    {(fields, { add, remove }) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            
                            <Collapse 
                                accordion
                                activeKey={activeKey}
                                onChange={(key) => setActiveKey(key)}
                                style={{ background: 'transparent', border: 'none' }}
                            >
                                {fields.map((field, index) => (
                                    <Collapse.Panel
                                        key={String(index)}
                                        header={
                                            <Space>
                                                <SettingOutlined style={{ color: '#1890ff' }} />
                                                <Text strong>Question #{index + 1}</Text>
                                                
                                                <Form.Item
                                                    shouldUpdate={(prev, curr) => 
                                                        prev.questions?.[index]?.title !== curr.questions?.[index]?.title
                                                    }
                                                    noStyle
                                                >
                                                    {({ getFieldValue }) => {
                                                        const title = getFieldValue(['questions', index, 'title']);
                                                        return title ? <Text type="secondary" style={{ fontWeight: 'normal', marginLeft: 8 }}>— {title}</Text> : null;
                                                    }}
                                                </Form.Item>
                                            </Space>
                                        }
                                        extra={genExtra(remove, field.name, fields.length)}
                                        style={{ 
                                            marginBottom: 12, 
                                            background: '#fff', 
                                            border: '1px solid #f0f0f0',
                                            borderRadius: 8,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ padding: '8px 0' }}>
                                            <Row gutter={16}>
                                                <Col xs={24} md={16}>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'title']}
                                                        label="Question Text"
                                                        rules={[{ required: true, message: 'Question text is required' }]}
                                                    >
                                                        <Input placeholder="Type your question here..." />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'type']}
                                                        label="Response Type"
                                                        rules={[{ required: true }]}
                                                    >
                                                        <Select>
                                                            <Option value={QuestionTypeValues.SINGLE_CHOICE}>Single Choice</Option>
                                                            <Option value={QuestionTypeValues.MULTIPLE_CHOICE}>Multiple Choice</Option>
                                                            <Option value={QuestionTypeValues.OPEN_TEXT}>Open Text</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(prev, curr) => 
                                                    prev.questions?.[index]?.type !== curr.questions?.[index]?.type
                                                }
                                            >
                                                {({ getFieldValue }) => {
                                                    const type = getFieldValue(['questions', index, 'type']);
                                                    
                                                    if (type === QuestionTypeValues.OPEN_TEXT) {
                                                        return (
                                                            <div style={{ padding: '16px', background: '#fafafa', borderRadius: 4, textAlign: 'center', color: '#999' }}>
                                                                Respondents will type their answer in a text box.
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <>
                                                            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                                                                Answer Options:
                                                            </Text>
                                                            <Form.List name={[field.name, 'possibleChoices']}>
                                                                {(optFields, { add: addOpt, remove: removeOpt }) => (
                                                                    <>
                                                                        {optFields.map((optField, optIndex) => (
                                                                            <div key={optField.key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                                                                <UnorderedListOutlined style={{ color: '#ccc' }} />
                                                                                <Form.Item
                                                                                    {...optField}
                                                                                    rules={[{ required: true, message: "Required" }]}
                                                                                    style={{ flex: 1, margin: 0 }}
                                                                                >
                                                                                    <Input placeholder={`Option ${optIndex + 1}`} />
                                                                                </Form.Item>
                                                                                
                                                                                {optFields.length > 2 && (
                                                                                    <MinusCircleOutlined 
                                                                                        onClick={() => removeOpt(optField.name)}
                                                                                        style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        
                                                                        {optFields.length < 8 && (
                                                                            <Button 
                                                                                type="dashed" 
                                                                                onClick={() => addOpt('')} 
                                                                                block 
                                                                                icon={<PlusOutlined />}
                                                                                style={{ marginTop: 8 }}
                                                                            >
                                                                                Add Option
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </Form.List>
                                                        </>
                                                    );
                                                }}
                                            </Form.Item>
                                        </div>
                                    </Collapse.Panel>
                                ))}
                            </Collapse>

                            <Button 
                                type="dashed" 
                                onClick={() => {
                                    add(DEFAULT_QUESTION);
                                    setActiveKey(String(fields.length));
                                }} 
                                block 
                                size="large"
                                icon={<PlusOutlined />}
                                disabled={fields.length >= 20}
                                style={{ height: 50 }}
                            >
                                Add New Question
                            </Button>
                        </div>
                    )}
                </Form.List>

                <Divider />
\
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <Button onClick={onCancel} icon={<ArrowLeftOutlined />} size="large">
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isSubmitting} 
                        icon={<SaveOutlined />}
                        size="large"
                    >
                        Create Survey
                    </Button>
                </div>
            </Form>
        </Card>
    );
};