import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#fa8c16',
          colorLink: '#fa8c16',
          borderRadius: 6,
          colorBgBase: '#ffffff',
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: '#fff7e6', 
            headerBg: '#ffffff',
            footerBg: '#fff7e6',
          },
        },
      }}
    >
      <AntdApp>
        {children}
      </AntdApp>
    </ConfigProvider>
  );
};