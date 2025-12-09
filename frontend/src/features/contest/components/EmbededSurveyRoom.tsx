import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { surveyService } from '@/features/survey/api/surveyService';
import { SurveySubmissionForm } from '@/features/survey/components/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/LiveResultSurveyDashboard';
import type { SurveyFormStructure } from '@/features/survey/model/types';

interface Props {
    roomId: string;
    ticket?: string;
    isHost: boolean;
}

export const EmbeddedSurveyRoom: React.FC<Props> = ({ roomId, ticket, isHost }) => {
    const { showError } = useSnackbar();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [surveyForm, setSurveyForm] = useState<SurveyFormStructure | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    
    // Używamy stanu lokalnego, bo backend może nadpisać isHost (np. jeśli user jest właścicielem ankiety)
    const [isRoomHost, setIsRoomHost] = useState(isHost); 

    useEffect(() => {
        let mounted = true;

        const joinRoom = async () => {
            setLoading(true);
            try {
                // Zakładam, że surveyService.joinRoom obsługuje (roomId, ticket)
                // Jeśli nie, musisz zaktualizować surveyService!
                const response = await surveyService.joinRoom(roomId, ticket);
                
                if (mounted) {
                    setSurveyForm(response.survey);
                    setHasSubmitted(response.hasSubmitted);
                    setIsRoomHost(response.host);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("Failed to join survey:", err);
                if (mounted) {
                    setError("Nie udało się dołączyć do ankiety. Może być zamknięta lub wymagane są uprawnienia.");
                    setLoading(false);
                }
            }
        };

        if (roomId) {
            joinRoom();
        }
        
        return () => { mounted = false; };
    }, [roomId, ticket]);

    const handleSubmissionSuccess = () => {
        setHasSubmitted(true);
    };

    const handleSubmissionFailure = () => {
        showError("Wystąpił błąd podczas wysyłania odpowiedzi. Spróbuj ponownie.");
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

    // 1. WIDOK HOSTA (Wyniki na żywo)
    if (isRoomHost) {
        return (
            <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', bgcolor: '#fff', p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">Panel Hosta (Wyniki na żywo)</Typography>
                <LiveResultSurveyDashboard roomId={roomId} isHost={true} />
            </Box>
        );
    }

    // 2. WIDOK UCZESTNIKA (Formularz lub Wyniki po wysłaniu)
    return (
        <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', bgcolor: '#fff', p: 2 }}>
            {hasSubmitted ? (
                <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Dziękujemy! Twoje odpowiedzi zostały zapisane.
                    </Alert>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Wyniki grupy:
                    </Typography>
                    <LiveResultSurveyDashboard 
                        roomId={roomId} 
                        isHost={false} 
                        isParticipantSubmitted={true} 
                    />
                </Box>
            ) : (
                surveyForm ? (
                    <SurveySubmissionForm 
                        roomId={roomId} 
                        surveyForm={surveyForm} 
                        onSubmissionSuccess={handleSubmissionSuccess}
                        onSubmissionFailure={handleSubmissionFailure}
                    />
                ) : (
                    <Alert severity="warning">Błąd ładowania formularza.</Alert>
                )
            )}
        </Box>
    );
};