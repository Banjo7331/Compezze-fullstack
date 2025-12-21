import React, { useState, useEffect } from 'react';
import { 
  List, 
  Card, 
  Typography, 
  Input, 
  Select, 
  Tag, 
  Button, 
  Row, 
  Col, 
  Space, 
  Alert, 
  Empty, 
  theme 
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  TrophyOutlined, 
  CalendarOutlined, 
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { contestService } from '@/features/contest/api/contestService';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ContestCategory } from '@/features/contest/model/types';

const { Text, Title } = Typography;
const { Option } = Select;

export const ContestPublicList: React.FC = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ContestCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<'CREATED' | 'LIVE' | ''>('');

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contestService.getPublicContests({
          page: page - 1,
          size: pageSize,
          sort: 'startDate,asc',
          search: debouncedSearch,
          category: category,
          status: statusFilter
        });
        
        setContests(data.content || []);
        setTotalItems(data.totalElements);
      } catch (err) {
        console.error(err);
        setError("Failed to load contests.");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [page, debouncedSearch, category, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, statusFilter]);

  return (
    <div style={{ paddingBottom: 24 }}>
      
      <Card bordered={false} style={{ marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Search by name..."
              prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={12} md={7}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              value={category || undefined}
              onChange={(val) => setCategory(val || '')}
              allowClear
            >
              <Option value="">All Categories</Option>
              {Object.values(ContestCategory).map((cat) => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} md={7}>
            <Select
              placeholder="Status"
              style={{ width: '100%' }}
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
              suffixIcon={<FilterOutlined />}
              allowClear
            >
              <Option value="">All Statuses</Option>
              <Option value="CREATED">Upcoming (Registration)</Option>
              <Option value="LIVE">Live (Running)</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 24 }} 
        />
      )}

      <List
        loading={loading}
        itemLayout="vertical"
        size="large"
        locale={{
          emptyText: (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="No contests found. Try changing filters." 
            />
          )
        }}
        pagination={{
          onChange: (p) => setPage(p),
          current: page,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: false,
          align: 'center',
        }}
        dataSource={contests}
        renderItem={(contest) => (
          <List.Item key={contest.id} style={{ padding: 0, marginBottom: 16 }}>
            <Card
              hoverable
              bodyStyle={{ padding: 24 }}
              style={{
                borderLeft: `6px solid ${token.colorPrimary}`,
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden'
              }}
              onClick={() => navigate(`/contest/${contest.id}`)}
            >
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                
                <Col xs={24} sm={16} md={18}>
                  <Space align="center" style={{ marginBottom: 8 }}>
                    <TrophyOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
                    <Title level={4} style={{ margin: 0 }}>
                      {contest.name}
                    </Title>
                    {contest.status === 'LIVE' && (
                      <Tag color="error" style={{ fontWeight: 'bold' }}>
                        LIVE
                      </Tag>
                    )}
                  </Space>

                  <Space wrap size="middle" style={{ display: 'flex', marginTop: 8 }}>
                    <Tag>{contest.category}</Tag>
                    
                    <Space size={4} style={{ color: token.colorTextSecondary }}>
                      <CalendarOutlined />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Start: {new Date(contest.startDate).toLocaleDateString()} {new Date(contest.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Space>
                  </Space>
                </Col>

                <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    ghost
                    size="large"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    style={{ width: '100%', maxWidth: 140 }}
                  >
                    View
                  </Button>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};