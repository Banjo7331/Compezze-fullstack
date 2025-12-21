import React, { useEffect } from 'react';
import { Form, Input, Button, Alert, Typography, Card } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import type { RegisterRequest } from '../model/types';

const { Title, Text } = Typography;

export const RegisterForm = () => {
    const { register, isLoading, isSuccess, error } = useRegister();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        const { confirmPassword, ...req } = values;
        register(req as RegisterRequest);
    };

    useEffect(() => {
        if (isSuccess) {
            navigate('/login');
        }
    }, [isSuccess, navigate]);

    useEffect(() => {
        if (error && typeof error === 'object' && 'field' in error) {
             form.setFields([{
                 name: (error as any).field,
                 errors: [(error as any).message]
             }]);
        }
    }, [error, form]);

    return (
        <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>Create Account</Title>
            </div>

            {error && typeof error === 'string' && (
                <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
            )}

            <Form
                form={form}
                name="register"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                scrollToFirstError
                disabled={isLoading}
            >
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        { required: true, message: 'Please input your username!' },
                        { min: 3, message: 'Username must be at least 3 characters.' }
                    ]}
                >
                    <Input placeholder="Username" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                        { type: 'email', message: 'The input is not valid E-mail!' },
                        { required: true, message: 'Please input your E-mail!' },
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 6, message: 'Password must be at least 6 characters.' }
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                </Form.Item>
                
                <div style={{ textAlign: 'center' }}>
                    <Text>Already have an account? </Text>
                    <Link to="/login">Log in</Link>
                </div>
            </Form>
        </Card>
    );
};