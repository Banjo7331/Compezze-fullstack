import React, { useState } from 'react';
import { 
    Card, Typography, Form, Radio, Checkbox, 
    Input, Button, Divider, Alert, Space 
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { surveyService } from '@/features/survey/api/surveyService';

import type { SurveyFormStructure, SubmitSurveyAttemptRequest } from '@/features/survey/model/types';
import { QuestionTypeValues } from '@/features/survey/model/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SurveySubmissionFormProps {
    surveyForm: SurveyFormStructure;
    roomId: string;
    onSubmissionSuccess: () => void;
    onSubmissionFailure: (error: any) => void;
}

export const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({ 
    surveyForm, 
    roomId, 
    onSubmissionSuccess, 
    onSubmissionFailure 
}) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish = async (values: any) => {
        setIsSubmitting(true);

        const participantAnswers = Object.entries(values).map(([key, val]) => {
            const questionId = Number(key.replace('q-', ''));
            const answers = Array.isArray(val) ? val : [val];
            return {
                questionId,
                answers: answers.filter((v: any) => v && String(v).trim().length > 0)
            };
        });

        const submissionData: SubmitSurveyAttemptRequest = {
            surveyId: surveyForm.id,
            participantAnswers
        };

        try {
            await surveyService.submitAnswers(roomId, submissionData);
            onSubmissionSuccess();
        } catch (error) {
            onSubmissionFailure(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>{surveyForm.title}</Title>
                <Text type="secondary">Room ID: {roomId}</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                {surveyForm.questions.map((question, index) => (
                    <div key={question.id}>
                        <Form.Item
                            name={`q-${question.id}`}
                            label={<span style={{ fontWeight: 'bold', fontSize: 16 }}>{`${index + 1}. ${question.title}`}</span>}
                            rules={[{ required: true, message: 'Please answer this question' }]}
                        >
                            {renderQuestionInput(question)}
                        </Form.Item>
                        <Divider dashed />
                    </div>
                ))}

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        size="large"
                        loading={isSubmitting}
                        icon={<SendOutlined />}
                    >
                        Submit Survey
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

const renderQuestionInput = (question: any) => {
    switch (question.type) {
        case QuestionTypeValues.SINGLE_CHOICE:
            return (
                <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {question.possibleChoices.map((choice: string, i: number) => (
                        <Radio key={i} value={choice}>{choice}</Radio>
                    ))}
                </Radio.Group>
            );
        case QuestionTypeValues.MULTIPLE_CHOICE:
            return (
                <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {question.possibleChoices.map((choice: string, i: number) => (
                        <Checkbox key={i} value={choice}>{choice}</Checkbox>
                    ))}
                </Checkbox.Group>
            );
        case QuestionTypeValues.OPEN_TEXT:
            return (
                <TextArea rows={3} placeholder="Type your answer here..." />
            );
        default: 
            return <Alert message="Unsupported question type" type="warning" />;
    }
};