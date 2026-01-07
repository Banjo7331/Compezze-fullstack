import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, theme, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { contestService } from '@/features/contest/api/contestService';
import type { TemplateDto } from '@/features/contest/model/types';

const { Text } = Typography;

interface Props {
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

export const TemplateSelector: React.FC<Props> = ({ selectedKey, onSelect }) => {
  const { token } = theme.useToken();
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contestService.getTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>;

  return (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        Choose Cover Theme
      </Text>
      <Row gutter={[16, 16]}>
        {templates.map((tpl) => {
          const isSelected = selectedKey === tpl.key;
          return (
            <Col xs={12} sm={8} md={6} key={tpl.key}>
              <div 
                onClick={() => onSelect(tpl.key)}
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer',
                  borderRadius: token.borderRadiusLG,
                  overflow: 'hidden',
                  border: isSelected ? `3px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <img 
                  src={tpl.url} 
                  alt={tpl.name} 
                  style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} 
                />
                
                {isSelected && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(250, 140, 22, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircleFilled style={{ fontSize: 32, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};