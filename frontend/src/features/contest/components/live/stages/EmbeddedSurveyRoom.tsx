import React, { useState, useEffect } from 'react';
import { Spin, Alert, Typography } from 'antd';

import { contestService } from '@/features/contest/api/contestService';
import { surveyService } from '@/features/survey/api/surveyService';
import { SurveySubmissionForm } from '@/features/survey/components/live/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/live/LiveResultSurveyDashboard';
import type { SurveyFormStructure } from '@/features/survey/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

const { Title } = Typography;

interface Props {
    roomId: string;
    contestId: string;
    contestRoomId: string;
    ticket?: string;
    isHost: boolean;
}

export const EmbeddedSurveyRoom: React.FC<Props> = ({ roomId, contestId, contestRoomId, ticket, isHost }) => {
    const { showError } = useSnackbar();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [surveyForm, setSurveyForm] = useState<SurveyFormStructure | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isRoomHost, setIsRoomHost] = useState(isHost); 

    useEffect(() => {
        let mounted = true;

        const joinRoom = async () => {
            setLoading(true);
            try {
                let tokenToUse = ticket;
                if (!tokenToUse && contestId) {
                    try {
                        console.log("Fetching survey token...");
                        tokenToUse = await contestService.getStageAccessToken(contestId, contestRoomId);
                    } catch (e) {
                        console.error("Failed to fetch survey token", e);
                    }
                }

                const response = await surveyService.joinRoom(roomId, tokenToUse);
                
                if (mounted) {
                    setSurveyForm(response.survey);
                    setHasSubmitted(response.hasSubmitted);
                    setIsRoomHost(response.host);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("Failed to join survey:", err);
                if (mounted) {
                    setError("Failed to join survey. It might be closed or requires permissions.");
                    setLoading(false);
                }
            }
        };

        if (roomId) joinRoom();
        return () => { mounted = false; };
    }, [roomId, contestId, contestRoomId, ticket]);

    const handleSubmissionSuccess = () => {
        setHasSubmitted(true);
    };

    const handleSubmissionFailure = () => {
        showError("An error occurred while submitting. Please try again.");
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 32 }}><Spin size="large" /></div>;
    if (error) return <Alert message="Error" description={error} type="error" showIcon style={{ margin: 16 }} />;

    if (isRoomHost) {
        return (
            <div style={{ width: '100%', height: '100%', overflowY: 'auto', backgroundColor: '#fff', padding: 16 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>Host Panel (Live Results)</Title>
                <LiveResultSurveyDashboard roomId={roomId} isHost={true} />
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto', backgroundColor: '#fff', padding: 16 }}>
            {hasSubmitted ? (
                <div>
                    <Alert 
                        message="Thank you!" 
                        description="Your responses have been saved." 
                        type="success" 
                        showIcon 
                        style={{ marginBottom: 16 }} 
                    />
                    <Title level={5} style={{ marginTop: 16, marginBottom: 16 }}>Group results:</Title>
                    <LiveResultSurveyDashboard 
                        roomId={roomId} 
                        isHost={false} 
                        isParticipantSubmitted={true} 
                    />
                </div>
            ) : (
                surveyForm ? (
                    <SurveySubmissionForm 
                        roomId={roomId} 
                        surveyForm={surveyForm} 
                        onSubmissionSuccess={handleSubmissionSuccess}
                        onSubmissionFailure={handleSubmissionFailure}
                    />
                ) : (
                    <Alert message="Error" description="Error loading form." type="warning" showIcon />
                )
            )}
        </div>
    );
};