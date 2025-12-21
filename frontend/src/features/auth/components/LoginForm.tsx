import React, { useEffect } from 'react';
import { Form, Input, Button, Alert, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '../hooks/useLogin';
import type { LoginRequest } from '../model/types';

const { Title } = Typography;

export const LoginForm = () => {
    const { login, isLoading, error } = useLogin();
    const [form] = Form.useForm();
    
    const onFinish = (values: LoginRequest) => {
        login(values);
    };

    return (
        <Card style={{ width: 350, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3}>Sign In</Title>
            </div>

            {error && (
                <Alert 
                    message="Error"
                    description={typeof error === 'string' ? error : 'Login failed'} 
                    type="error" 
                    showIcon 
                    style={{ marginBottom: 24 }} 
                />
            )}

            <Form
                form={form}
                name="login_form"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                disabled={isLoading}
            >
                <Form.Item
                    name="usernameOrEmail"
                    rules={[{ required: true, message: 'Please input your Username or Email!' }]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Username or Email" 
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="Password" 
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};