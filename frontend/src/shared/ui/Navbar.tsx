import React from 'react';
import { Layout, Button, Typography, Avatar, Dropdown, Space, theme, Tooltip } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

const NavBar: React.FC = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Contest', path: '/contest' },
    { label: 'Survey', path: '/survey' },
    { label: 'Quiz', path: '/quiz' },
  ];

  const userMenuPayload: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Signed in as</Text>
          <br />
          <Text strong>{currentUser?.username}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: token.colorPrimary,
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Text
            strong
            style={{
              fontSize: 20,
              color: '#fff',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Compezze Platform
          </Text>
        </Link>

        <Space size="middle">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  type="text"
                  style={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontWeight: isActive ? 600 : 400,
                    textTransform: 'uppercase',
                    fontSize: 14,
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </Space>
      </div>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuPayload }} trigger={['click']} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Account settings">
                <Avatar
                  style={{ backgroundColor: '#fff', color: token.colorPrimary }}
                  icon={<UserOutlined />}
                  size="large"
                />
              </Tooltip>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Link to="/login">
              <Button type="text" style={{ color: '#fff' }}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button style={{ backgroundColor: '#fff', color: token.colorPrimary, border: 'none' }}>
                Register
              </Button>
            </Link>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default NavBar;