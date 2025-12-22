import React, { useEffect, useState } from 'react';
import { List, Input, Pagination, Spin, Typography, Avatar, Empty } from 'antd';
import { SearchOutlined, FileTextOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { quizService } from '../api/quizService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { GetQuizFormSummaryResponse } from '../model/types';

const { Text } = Typography;

export const AllQuizTemplatesList: React.FC = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState<GetQuizFormSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await quizService.getAllForms({ 
                    page, 
                    size: 10, 
                    sort: 'title,asc',
                    search: debouncedSearch 
                });
                setForms(data.content);
                setTotalItems(data.totalElements);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [page, debouncedSearch]);

    useEffect(() => { setPage(0); }, [debouncedSearch]);

    if (loading && forms.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <Input
                    size="large"
                    placeholder="Search quizzes..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>

            <List
                itemLayout="horizontal"
                dataSource={forms}
                loading={loading}
                locale={{
                    emptyText: <Empty description="No quiz templates found." />
                }}
                renderItem={(form) => (
                    <List.Item
                        style={{ 
                            cursor: 'pointer', 
                            padding: '16px 24px',
                            transition: 'background-color 0.3s'
                        }}
                        className="quiz-list-item"
                        onClick={() => navigate(`/quiz/create/${form.id}`)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar 
                                    style={{ backgroundColor: '#1890ff' }} 
                                    icon={<FileTextOutlined />} 
                                />
                            }
                            title={<Text strong>{form.title}</Text>}
                            description={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                    {form.isPrivate ? <LockOutlined /> : <GlobalOutlined />}
                                    <span>{form.isPrivate ? "Private" : "Public"}</span>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />

            {totalItems > 10 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                    <Pagination 
                        current={page + 1}
                        total={totalItems} 
                        pageSize={10}
                        onChange={(p) => setPage(p - 1)}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};