import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  List, 
  Typography, 
  Button, 
  Tag, 
  Space, 
  Pagination, 
  theme, 
  Empty, 
  Spin 
} from 'antd';
import { 
  TrophyOutlined, 
  CalendarOutlined, 
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { contestService } from '../api/contestService';
import type { UpcomingContestDto } from '../model/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const { Text } = Typography;

export const MyEnteredContestsDialog: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  
  const [contests, setContests] = useState<UpcomingContestDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (open) {
      const fetch = async () => {
        setIsLoading(true);
        try {
          const data = await contestService.getMyParticipatedContests({ 
            page, 
            size: 5,
            sort: 'startDate,asc' 
          });
          setContests(data.content);
          setTotalPages(data.totalPages);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }
  }, [open, page]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title={
        <Space>
          <TrophyOutlined style={{ color: token.colorWarning }} />
          <span>My Events</span>
        </Space>
      }
      width={600}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {isLoading ? (
          <div style={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" />
          </div>
        ) : contests.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="No upcoming events found." 
            style={{ margin: '40px 0' }}
          />
        ) : (
          <>
            <div 
              style={{ 
                maxHeight: '60vh', 
                overflowY: 'auto', 
                paddingRight: 4,
                marginRight: -4 
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={contests}
                renderItem={(contest) => (
                  <div
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusLG,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      backgroundColor: '#fff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = token.colorFillAlter;
                      e.currentTarget.style.borderColor = token.colorPrimaryBorder;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.borderColor = token.colorBorderSecondary;
                    }}
                    onClick={() => {
                      navigate(`/contest/${contest.id}`);
                      onClose();
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{contest.name}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space size="small">
                          {contest.isOrganizer && (
                            <Tag color="warning" bordered={false}>
                              Host
                            </Tag>
                          )}
                          <Tag bordered={false}>
                            {contest.category}
                          </Tag>
                          <Space size={4} style={{ color: token.colorTextSecondary, fontSize: 12 }}>
                            <CalendarOutlined />
                            {new Date(contest.startDate).toLocaleDateString()}
                          </Space>
                        </Space>
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      ghost 
                      size="small" 
                      icon={<ArrowRightOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contest/${contest.id}`);
                        onClose();
                      }}
                    >
                      Go
                    </Button>
                  </div>
                )}
              />
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 16 }}>
                <Pagination 
                  simple
                  current={page + 1} 
                  total={totalPages * 5} 
                  pageSize={5}
                  onChange={(p) => setPage(p - 1)} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};