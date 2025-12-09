import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Box, Alert, CircularProgress, 
    Button as MuiButton, Paper, Stack, Divider, Grid 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { surveyService } from '@/features/survey/api/surveyService';
import { SurveySubmissionForm } from '@/features/survey/components/SurveySubmissionForm';
import { LiveResultSurveyDashboard } from '@/features/survey/components/LiveResultSurveyDashboard';
import { RoomControlPanel } from '@/features/survey/components/RoomControlPanel';
import { InviteUsersPanel } from '@/features/survey/components/InviteUserPanel';

import type { SurveyFormStructure } from '@/features/survey/model/types';

const SurveyRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [loadingState, setLoadingState] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const [isHost, setIsHost] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [surveyForm, setSurveyForm] = useState<SurveyFormStructure | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const enterRoom = async () => {
            setLoadingState('LOADING');
            try {
                const response = await surveyService.joinRoom(roomId);
                
                setSurveyForm(response.survey);
                setIsHost(response.host);
                setIsSubmitted(response.hasSubmitted);
                
                setLoadingState('READY');

            } catch (error: any) {
                console.error("Failed to enter room:", error);
                setErrorMsg(error.message || "Could not access the room.");
                setLoadingState('ERROR');
            }
        };

        enterRoom();
    }, [roomId]);

    const handleSubmissionSuccess = () => setIsSubmitted(true);
    const handleSubmissionFailure = () => alert("Submission failed. Try again.");
    
    const handleRoomClosed = () => {
        console.log("Room closed.");
    };

    if (!roomId) return <Container><Alert severity="error">Missing Room ID</Alert></Container>;

    if (loadingState === 'LOADING') {
        return (
            <Container sx={{ mt: 10, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Entering Room...</Typography>
            </Container>
        );
    }

    if (loadingState === 'ERROR') {
        return (
            <Container sx={{ mt: 10 }}>
                <Alert severity="error">{errorMsg}</Alert>
                <MuiButton onClick={() => navigate('/survey')} sx={{ mt: 2 }}>Back</MuiButton>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                {isHost && (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <RoomControlPanel roomId={roomId} onCloseSuccess={handleRoomClosed} />
                            <InviteUsersPanel roomId={roomId} />
                            
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <MuiButton onClick={() => navigate('/survey')} startIcon={<ArrowBackIcon />}>
                                    Back to My Surveys
                                </MuiButton>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h5" color="primary" gutterBottom>Host Dashboard</Typography>
                                <LiveResultSurveyDashboard roomId={roomId} isHost={true} />
                            </Paper>
                        </Grid>
                    </Grid>
                )}


                {!isHost && (
                    <Container maxWidth="md">
                        {isSubmitted ? (
                            <Paper elevation={4} sx={{ p: 4 }}>
                                <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <SendIcon color="success" sx={{ fontSize: 60 }} />
                                    <Typography variant="h5" color="success.main">Survey Completed</Typography>
                                    <Typography variant="body2">Thank you! Watch the live results below.</Typography>
                                </Stack>
                                <Divider sx={{ mb: 3 }} />
                                
                                <LiveResultSurveyDashboard 
                                    roomId={roomId} 
                                    isHost={false} 
                                    isParticipantSubmitted={true} 
                                />
                            </Paper>
                        ) : (
                            surveyForm ? (
                                <SurveySubmissionForm
                                    roomId={roomId}
                                    surveyForm={surveyForm}
                                    onSubmissionSuccess={handleSubmissionSuccess}
                                    onSubmissionFailure={handleSubmissionFailure}
                                />
                            ) : (
                                <Alert severity="warning">Loading form data failed.</Alert>
                            )
                        )}
                    </Container>
                )}

            </Box>
        </Container>
    );
};

export default SurveyRoomPage;