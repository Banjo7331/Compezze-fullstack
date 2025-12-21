import React from 'react';
import { Card, Steps, theme } from 'antd';
import type { ContestDetailsDto } from '@/features/contest/model/types';

export const ContestStagesStepper: React.FC<{ contest: ContestDetailsDto }> = ({ contest }) => {
  const { token } = theme.useToken();
  const activeStep = contest.status === 'FINISHED' ? contest.stages.length : 0; 

  return (
    <Card style={{ marginBottom: 24, borderColor: token.colorBorderSecondary }}>
      <Steps 
        current={activeStep} 
        items={contest.stages.map(stage => ({
          title: stage.name,
          description: stage.type
        }))}
      />
    </Card>
  );
};