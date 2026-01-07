import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { HourglassOutlined } from '@ant-design/icons';

import type { StageSettingsResponse } from '@/features/contest/model/types';

import { EmbeddedQuizRoom } from '@/features/contest/components/live/stages/EmbeddedQuizRoom';
import { EmbeddedSurveyRoom } from '@/features/contest/components/live/stages/EmbeddedSurveyRoom';

import { ContestJuryStage } from '@/features/contest/components/live/stages/ContestJuryStage';
import { ContestPublicVoteStage } from '@/features/contest/components/live/stages/ContestPublicVoteStage';
import { ContestGenericStage } from '@/features/contest/components/live/stages/ContestGenericStage';

const { Title, Text } = Typography;

interface Props {
    roomId: string;
    settings: StageSettingsResponse;
    isOrganizer: boolean;
    ticket?: string | null;
    contestId: string;
    isJury: boolean;
    currentSubmission?: any;
}

export const ContestStageRenderer: React.FC<Props> = ({ 
    roomId, settings, isOrganizer, ticket, contestId, isJury 
}) => {

    if (settings.type === 'QUIZ') {
        if (!settings.activeRoomId) return <Alert message="Error" description="Missing Quiz Session ID." type="error" showIcon />;
        return (
            <div style={{ marginTop: 16, width: '100%', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <EmbeddedQuizRoom 
                    roomId={settings.activeRoomId}
                    contestId={contestId}
                    contestRoomId={roomId}
                    ticket={ticket || undefined}
                    isHost={isOrganizer}
                />
            </div>
        );
    }

    if (settings.type === 'SURVEY') {
        if (!settings.activeRoomId) return <Alert message="Error" description="Missing Survey Session ID." type="error" showIcon />;
        return (
            <div style={{ marginTop: 16, width: '100%', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minHeight: 500 }}>
                <EmbeddedSurveyRoom 
                    roomId={settings.activeRoomId}
                    contestId={contestId}
                    contestRoomId={roomId}
                    ticket={ticket || undefined}
                    isHost={isOrganizer}
                />
            </div>
        );
    }

    if (settings.type === 'JURY_VOTE') {
        return (
            <ContestJuryStage 
                contestId={contestId} 
                roomId={roomId}
                settings={settings} 
                isOrganizer={isOrganizer} 
                isJury={isJury} 
            />
        );
    }

    if (settings.type === 'PUBLIC_VOTE') {
        return (
            <ContestPublicVoteStage 
                contestId={contestId} 
                roomId={roomId}
                settings={settings} 
            />
        );
    }

    if (settings.type === 'GENERIC') {
          return <ContestGenericStage name="Break / Information" />;
    }

    return (
        <Card style={{ padding: 48, textAlign: 'center' }}>
            <HourglassOutlined style={{ fontSize: 40, color: '#8c8c8c', marginBottom: 8, opacity: 0.5 }} />
            <Title level={4} style={{ marginBottom: 8 }}>Waiting</Title>
            <Text type="secondary">
                Stage configuration in progress...
            </Text>
        </Card>
    );
};