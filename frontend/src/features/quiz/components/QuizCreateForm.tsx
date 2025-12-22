import React, { useState } from 'react';
import { 
    Card, Form, Input, Button, Switch, Select, InputNumber, 
    Divider, Typography, Row, Col, Checkbox, 
    Popconfirm, message, Collapse, Space, Tooltip 
} from 'antd';
import { 
    PlusOutlined, 
    SaveOutlined, 
    ArrowLeftOutlined, 
    DeleteOutlined, 
    MinusCircleOutlined,
    SettingOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

import { quizService } from '../api/quizService'; 
import { QuestionType } from '../model/types';
import type { CreateQuizFormRequest } from '../model/types';

const { Text } = Typography;
const { Option } = Select;

interface QuizCreateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

const DEFAULT_OPTION = { text: '', isCorrect: false };

const DEFAULT_TRUE_FALSE_OPTIONS = [
    { text: 'Prawda', isCorrect: true },
    { text: 'Fałsz', isCorrect: false }
];

const DEFAULT_QUESTION = {
    title: '',
    type: QuestionType.SINGLE_CHOICE,
    points: 1000,
    options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
    ]
};

export const QuizCreateForm: React.FC<QuizCreateFormProps> = ({ onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [activeKey, setActiveKey] = useState<string | string[]>(['0']);

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.questions) {
            changedValues.questions.forEach((changedQ: any, qIndex: number) => {
                if (!changedQ) return;

                if (changedQ.type) {
                    const newType = changedQ.type;
                    const currentQuestions = [...allValues.questions];
                    
                    if (newType === QuestionType.TRUE_FALSE) {
                        currentQuestions[qIndex].options = DEFAULT_TRUE_FALSE_OPTIONS;
                    } else if (allValues.questions[qIndex].options.length === 2 && allValues.questions[qIndex].options[0].text === 'Prawda') {
                        currentQuestions[qIndex].options = [
                            { text: '', isCorrect: true },
                            { text: '', isCorrect: false }
                        ];
                    }
                    form.setFieldsValue({ questions: currentQuestions });
                }

                if (changedQ.options) {
                    changedQ.options.forEach((changedOpt: any, oIndex: number) => {
                        if (changedOpt && changedOpt.isCorrect === true) {
                            const currentType = allValues.questions[qIndex].type;
                            
                            if (currentType === QuestionType.SINGLE_CHOICE || currentType === QuestionType.TRUE_FALSE) {
                                const currentOptions = allValues.questions[qIndex].options;
                                const newOptions = currentOptions.map((opt: any, idx: number) => ({
                                    ...opt,
                                    isCorrect: idx === oIndex
                                }));
                                
                                const newQuestions = [...allValues.questions];
                                newQuestions[qIndex].options = newOptions;
                                form.setFieldsValue({ questions: newQuestions });
                            }
                        }
                    });
                }
            });
        }
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        try {
            const questions = values.questions || [];
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const hasCorrect = q.options.some((o: any) => o.isCorrect);
                if (!hasCorrect) {
                    messageApi.error(`Pytanie #${i + 1} musi mieć zaznaczoną poprawną odpowiedź.`);
                    setActiveKey(String(i));
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload: CreateQuizFormRequest = {
                title: values.title,
                isPrivate: values.isPrivate || false,
                questions: values.questions
            };

            await quizService.createForm(payload);
            messageApi.success("Quiz został utworzony pomyślnie!");
            onSuccess();
        } catch (error) {
            console.error(error);
            messageApi.error("Wystąpił błąd podczas tworzenia quizu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const genExtra = (removeFn: (index: number | number[]) => void, name: number, length: number) => (
        <Popconfirm 
            title="Usunąć to pytanie?" 
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
                onValuesChange={handleValuesChange}
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
                            label="Tytuł Quizu"
                            rules={[
                                { required: true, message: 'Podaj tytuł quizu' },
                                { min: 3, message: 'Min 3 znaki' },
                                { max: 50, message: 'Max 50 znaków' }
                            ]}
                        >
                            <Input placeholder="Np. Wiedza o Świecie 2024" size="large" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="isPrivate" label="Widoczność" valuePropName="checked">
                            <Switch checkedChildren="Prywatny" unCheckedChildren="Publiczny" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Pytania</Divider>

                <Form.List name="questions">
                    {(fields, { add, remove }) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            
                            <Collapse 
                                accordion
                                activeKey={activeKey}
                                onChange={(key) => setActiveKey(key)}
                                className="quiz-collapse"
                                style={{ background: 'transparent', border: 'none' }}
                            >
                                {fields.map((field, index) => (
                                    <Collapse.Panel
                                        key={String(index)}
                                        header={
                                            <Space style={{ width: '100%' }}>
                                                <SettingOutlined style={{ color: '#fa8c16' }} />
                                                <Text strong>Pytanie #{index + 1}</Text>
                                                
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
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'title']}
                                                        label="Treść Pytania"
                                                        rules={[{ required: true, message: 'Treść jest wymagana' }]}
                                                    >
                                                        <Input placeholder="Wpisz pytanie..." />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'type']}
                                                        label="Typ Pytania"
                                                        rules={[{ required: true }]}
                                                    >
                                                        <Select>
                                                            <Option value={QuestionType.SINGLE_CHOICE}>Jednokrotny wybór</Option>
                                                            <Option value={QuestionType.MULTIPLE_CHOICE}>Wielokrotny wybór</Option>
                                                            <Option value={QuestionType.TRUE_FALSE}>Prawda / Fałsz</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <Form.Item
                                                        {...field}
                                                        name={[field.name, 'points']}
                                                        label="Punkty"
                                                        initialValue={1000}
                                                    >
                                                        <InputNumber min={0} max={5000} style={{ width: '100%' }} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
                                                Zaznacz <CheckCircleOutlined /> poprawne odpowiedzi:
                                            </Text>

                                            <Form.List name={[field.name, 'options']}>
                                                {(optFields, { add: addOpt, remove: removeOpt }) => (
                                                    <>
                                                        {optFields.map((optField, optIndex) => (
                                                            <div key={optField.key} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                                                                <Tooltip title="Czy to poprawna odpowiedź?">
                                                                    <Form.Item
                                                                        {...optField}
                                                                        name={[optField.name, 'isCorrect']}
                                                                        valuePropName="checked"
                                                                        noStyle
                                                                    >
                                                                        <Checkbox />
                                                                    </Form.Item>
                                                                </Tooltip>

                                                                <Form.Item
                                                                    {...optField}
                                                                    name={[optField.name, 'text']}
                                                                    rules={[{ required: true, message: 'Wpisz odpowiedź' }]}
                                                                    style={{ flex: 1, margin: 0 }}
                                                                >
                                                                    <Input placeholder={`Opcja ${optIndex + 1}`} />
                                                                </Form.Item>

                                                                <Form.Item shouldUpdate noStyle>
                                                                    {({ getFieldValue }) => {
                                                                        const type = getFieldValue(['questions', index, 'type']);
                                                                        if (type === QuestionType.TRUE_FALSE) return null;
                                                                        
                                                                        return optFields.length > 2 ? (
                                                                            <MinusCircleOutlined 
                                                                                onClick={() => removeOpt(optField.name)}
                                                                                style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 16 }}
                                                                            />
                                                                        ) : <div style={{ width: 16 }} />;
                                                                    }}
                                                                </Form.Item>
                                                            </div>
                                                        ))}

                                                        <Form.Item shouldUpdate noStyle>
                                                            {({ getFieldValue }) => {
                                                                const currentQ = getFieldValue(['questions', index]);
                                                                const isTF = currentQ?.type === QuestionType.TRUE_FALSE;
                                                                const count = currentQ?.options?.length || 0;

                                                                if (!isTF && count < 6) {
                                                                    return (
                                                                        <Button 
                                                                            type="dashed" 
                                                                            onClick={() => addOpt(DEFAULT_OPTION)} 
                                                                            block 
                                                                            icon={<PlusOutlined />}
                                                                            size="small"
                                                                            style={{ marginTop: 8, maxWidth: 200 }}
                                                                        >
                                                                            Dodaj Opcję
                                                                        </Button>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
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
                                disabled={fields.length >= 50}
                                style={{ height: 50 }}
                            >
                                Dodaj Nowe Pytanie
                            </Button>
                        </div>
                    )}
                </Form.List>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <Button onClick={onCancel} icon={<ArrowLeftOutlined />} size="large">
                        Anuluj
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isSubmitting} 
                        icon={<SaveOutlined />}
                        size="large"
                        style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                    >
                        Stwórz Quiz
                    </Button>
                </div>
            </Form>
        </Card>
    );
};