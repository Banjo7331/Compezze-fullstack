import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Box, Stack, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import StopCircleIcon from '@mui/icons-material/StopCircle';

import { Button } from '@/shared/ui/Button';
import { contestService } from '@/features/contest/api/contestService';
import { useContestSocket } from '@/features/contest/hooks/useContestSocket';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { GetContestRoomDetailsResponse, ContestDetailsDto } from '@/features/contest/model/types';

import { ContestLobbyView } from '@/features/contest/components/ContestLobbyView';
import { ContestStageRenderer } from '@/features/contest/components/ContestStageRenderer';

const ContestLivePage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [roomState, setRoomState] = useState<GetContestRoomDetailsResponse | null>(null);
    const [contestInfo, setContestInfo] = useState<ContestDetailsDto | null>(null); 
    const [stageTicket, setStageTicket] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);

    const fetchState = useCallback(async () => {
        try {
            const roomData = await contestService.getRoomDetails(contestId!);
            setRoomState(roomData);
            
            if (!contestInfo) {
                const infoData = await contestService.getContestDetails(contestId!);
                setContestInfo(infoData);
            }

            const settings = roomData.currentStageSettings;
            if (settings && (settings.type === 'QUIZ' || settings.type === 'SURVEY') && settings.activeRoomId) {
                try {
                    const token = await contestService.getStageAccessToken(contestId!, settings.activeRoomId);
                    setStageTicket(token);
                } catch (e) {
                    setStageTicket(null);
                }
            } else {
                setStageTicket(null);
            }
        } catch (e) {
            console.error(e);
            showError("Błąd pobierania stanu sesji.");
        } finally {
            setIsLoading(false);
        }
    }, [contestId, contestInfo]);

    useEffect(() => {
        if (contestId) fetchState();
    }, [contestId, fetchState]);

    useContestSocket({ 
        contestId, 
        onRefresh: fetchState 
    });

    // --- HANDLERY ---
    const handleStartContest = async () => {
        try {
            await contestService.startContest(contestId!);
            showSuccess("Start!");
            fetchState(); 
        } catch (e) { showError("Błąd startu."); }
    };

    const handleNextStage = async () => {
        if(!window.confirm("Następny etap?")) return;
        try {
            await contestService.nextStage(contestId!);
            showSuccess("Zmieniono etap.");
            fetchState();
        } catch (e) { showError("Błąd."); }
    };

    const handleFinishStage = async () => {
        if(!window.confirm("Zakończyć etap?")) return;
        try {
            await contestService.finishStage(contestId!);
            showSuccess("Etap zakończony.");
            fetchState(); 
        } catch (e) { showError("Błąd."); }
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
    if (!roomState) return <Container sx={{ mt: 4 }}><Alert severity="error">Błąd sesji.</Alert></Container>;

    const isOrganizer = contestInfo?.organizer || false;
    const isJury = contestInfo?.myRoles?.includes('JURY') || false; // ✅ SPRAWDZAMY CZY JURY
    const isLobby = roomState.currentStagePosition === 0;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/contest/${contestId}`)}>
                    Wyjdź z Live
                </Button>
            </Box>

            {isLobby ? (
                <ContestLobbyView isOrganizer={isOrganizer} onStart={handleStartContest} />
            ) : (
                <Box>
                    <Box textAlign="center" mb={4}>
                         <Typography variant="overline" fontSize="1.2rem" letterSpacing={4} color="text.secondary">
                             ETAP {roomState.currentStagePosition}
                         </Typography>
                    </Box>

                    {roomState.currentStageSettings ? (
                        <ContestStageRenderer 
                            settings={roomState.currentStageSettings}
                            isOrganizer={isOrganizer}
                            ticket={stageTicket}
                            // ✅ PRZEKAZUJEMY NOWE DANE
                            contestId={contestId!}
                            isJury={isJury}
                        />
                    ) : (
                        <Paper sx={{ p: 6, textAlign: 'center' }}>
                            <Typography variant="h4" gutterBottom>Przerwa / Wyniki</Typography>
                            <Typography color="text.secondary">Oczekuj na rozpoczęcie kolejnego etapu.</Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {isOrganizer && !isLobby && (
                <Paper elevation={10} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: '#212121', color: 'white', zIndex: 1000 }}>
                    <Container maxWidth="lg">
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">PANEL STEROWANIA</Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" color="warning" startIcon={<StopCircleIcon />} onClick={handleFinishStage}>Stop (Przerwa)</Button>
                                <Button variant="contained" color="secondary" endIcon={<NextPlanIcon />} onClick={handleNextStage}>Następny Etap</Button>
                            </Stack>
                        </Stack>
                    </Container>
                </Paper>
            )}
            
            {isOrganizer && !isLobby && <Box sx={{ height: 100 }} />}
        </Container>
    );
};

export default ContestLivePage;