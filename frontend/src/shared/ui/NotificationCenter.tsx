import React, { useState, useMemo } from 'react';
import { 
  Popover, 
  Badge, 
  Button, 
  List, 
  Select, 
  Typography, 
  Empty, 
  theme,
  Space,
  Divider
} from 'antd';
import { 
  BellOutlined, 
  BarChartOutlined, 
  TrophyOutlined, 
  QuestionCircleOutlined, 
  CloseOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { 
  useNotificationCenter, 
  type NotificationType,
  type AppNotification
} from '@/app/providers/NotificationProvider';

const { Text } = Typography;
const { Option } = Select;

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotificationCenter();
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const filteredNotifications = useMemo(() => {
    if (filterType === 'ALL') return notifications;
    return notifications.filter(n => n.type === filterType);
  }, [notifications, filterType]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: notifications.length };
    notifications.forEach(n => {
      c[n.type] = (c[n.type] || 0) + 1;
    });
    return c;
  }, [notifications]);

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
    <div style={{ width: 380 }}>
      <div style={{ padding: '8px 16px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 16 }}>Notifications</Text>
        
        <Select
          defaultValue="ALL"
          value={filterType}
          onChange={setFilterType}
          style={{ width: 160 }}
          size="small"
          suffixIcon={<FilterOutlined style={{ fontSize: 10 }} />}
          dropdownMatchSelectWidth={false}
        >
          <Option value="ALL">All ({counts.ALL || 0})</Option>
          <Option value="CONTEST">
            <Space><TrophyOutlined /> Contests ({counts.CONTEST || 0})</Space>
          </Option>
          <Option value="QUIZ">
            <Space><QuestionCircleOutlined /> Quizzes ({counts.QUIZ || 0})</Space>
          </Option>
          <Option value="SURVEY">
            <Space><BarChartOutlined /> Surveys ({counts.SURVEY || 0})</Space>
          </Option>
        </Select>
      </div>

      <Divider style={{ margin: 0 }} />

      <div style={{ maxHeight: 400, overflowY: 'auto', padding: 0 }}>
        {filteredNotifications.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="No notifications found" 
            style={{ margin: '24px 0' }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                className="notification-item"
                style={{ 
                  padding: '12px 16px',
                  backgroundColor: item.isRead ? 'transparent' : token.colorFillAlter,
                  cursor: item.actionUrl ? 'pointer' : 'default',
                  borderBottom: `1px solid ${token.colorSplit}`,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = token.colorFillSecondary; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = item.isRead ? 'transparent' : token.colorFillAlter; }}
                actions={[
                  <Button 
                    key="close" 
                    type="text" 
                    icon={<CloseOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />} 
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
                      width: 36, height: 36, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', 
                      border: `1px solid ${token.colorBorderSecondary}`
                    }}>
                      {getIcon(item.type)}
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong={!item.isRead} style={{ fontSize: 14 }}>{item.title}</Text>
                      {!item.isRead && <Badge status="processing" color={token.colorPrimary} />}
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4, lineHeight: 1.4 }}>
                        {item.message}
                      </Text>
                      <Space size={8} split={<Divider type="vertical" style={{ margin: 0 }} />}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.type}
                        </Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '8px 16px', textAlign: 'center', backgroundColor: token.colorBgLayout }}>
            <Button type="link" size="small" onClick={clearAll} style={{ color: token.colorTextSecondary }}>
              Clear all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="topRight"
      overlayInnerStyle={{ padding: 0 }}
      arrow={false}
    >
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          zIndex: 2000 
        }}
      >
        <Badge count={unreadCount} overflowCount={99} offset={[-5, 5]}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<BellOutlined style={{ fontSize: 22 }} />}
            style={{ 
              width: 56, 
              height: 56, 
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              border: 'none'
            }}
          />
        </Badge>
      </div>
    </Popover>
  );
};