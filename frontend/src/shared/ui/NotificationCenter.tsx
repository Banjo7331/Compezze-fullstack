import React, { useState } from 'react';
import { 
  Popover, 
  Badge, 
  Button, 
  List, 
  Tabs, 
  Typography, 
  Empty, 
  theme,
  Space
} from 'antd';
import { 
  BellOutlined, 
  BarChartOutlined, 
  TrophyOutlined, 
  QuestionCircleOutlined, 
  CloseOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { 
  useNotificationCenter, 
  type NotificationType,
  type AppNotification
} from '@/app/providers/NotificationProvider';

const { Text } = Typography;

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotificationCenter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.type === activeTab;
  });

  const handleAction = (notif: AppNotification) => {
    markAsRead(notif.id);
    setOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SURVEY': return <BarChartOutlined style={{ color: token.colorPrimary }} />;
      case 'CONTEST': return <TrophyOutlined style={{ color: token.colorWarning }} />;
      case 'QUIZ': return <QuestionCircleOutlined style={{ color: token.colorSuccess }} />;
      default: return <BellOutlined />;
    }
  };

  const content = (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 8px' }}>
        <Text strong style={{ fontSize: 16 }}>Notifications</Text>
        {notifications.length > 0 && (
          <Button type="link" size="small" onClick={clearAll} style={{ padding: 0 }}>
            Clear all
          </Button>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'ALL', label: 'All' },
          { key: 'CONTEST', label: 'Contests', icon: <TrophyOutlined /> },
          { key: 'SURVEY', label: 'Surveys', icon: <BarChartOutlined /> },
          { key: 'QUIZ', label: 'Quizzes', icon: <QuestionCircleOutlined /> },
        ]}
        tabBarStyle={{ marginBottom: 0, padding: '0 8px' }}
      />

      <div style={{ maxHeight: 400, overflowY: 'auto', padding: 0 }}>
        {filteredNotifications.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No notifications" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                style={{ 
                  padding: '12px 16px',
                  backgroundColor: item.isRead ? 'transparent' : token.colorFillAlter,
                  cursor: item.actionUrl ? 'pointer' : 'default',
                  transition: 'background-color 0.3s'
                }}
                actions={[
                  <Button 
                    key="close" 
                    type="text" 
                    icon={<CloseOutlined style={{ fontSize: 12 }} />} 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(item.id);
                    }} 
                  />
                ]}
                onClick={() => handleAction(item)}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      backgroundColor: token.colorBgContainer, 
                      padding: 8, 
                      borderRadius: '50%', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                    }}>
                      {getIcon(item.type)}
                    </div>
                  }
                  title={
                    <Space size={4}>
                      <Text strong={!item.isRead}>{item.title}</Text>
                      {!item.isRead && <Badge status="processing" />}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        {item.message}
                      </Text>
                      <Space split={<div style={{ width: 1, height: 10, background: '#d9d9d9' }} />}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </Text>
                        {item.actionUrl && (
                          <Text style={{ fontSize: 11, color: token.colorPrimary }}>
                            Click to open
                          </Text>
                        )}
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="topRight"
      overlayInnerStyle={{ padding: '12px 0' }}
    >
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          zIndex: 2000 
        }}
      >
        <Badge count={unreadCount} overflowCount={99}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<BellOutlined style={{ fontSize: 20 }} />}
            style={{ 
              width: 56, 
              height: 56, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          />
        </Badge>
      </div>
    </Popover>
  );
};