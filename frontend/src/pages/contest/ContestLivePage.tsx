import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Box, Stack, Paper, Typography, Grid } from '@mui/material'; // ✅ Dodano Grid
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import FlagIcon from '@mui/icons-material/Flag';

import { Button } from '@/shared/ui/Button';
import { contestService } from '@/features/contest/api/contestService';
import { useContestSocket } from '@/features/contest/hooks/useContestSocket';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { GetContestRoomDetailsResponse, ContestDetailsDto } from '@/features/contest/model/types';

import { ContestLobbyView } from '@/features/contest/components/ContestLobbyView';
import { ContestStageRenderer } from '@/features/contest/components/ContestStageRenderer';
import { ContestLiveChat } from '@/features/contest/components/ContestLiveChat';
import { ContestLeaderboard } from '@/features/contest/components/ContestLeaderboard';
import { ContestFinishedView } from '@/features/contest/components/ContestFinishedView';

import { useAuth } from '@/features/auth/AuthContext';

const ContestLivePage: React.FC = () => {
    const { currentUserId } = useAuth();
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [roomState, setRoomState] = useState<GetContestRoomDetailsResponse | null>(null);
    const [contestInfo, setContestInfo] = useState<ContestDetailsDto | null>(null); 
    const [stageTicket, setStageTicket] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const isFinished = contestInfo?.status === 'FINISHED';

    const fetchState = useCallback(async () => {
        try {
            const roomData = await contestService.getRoomDetails(contestId!);
            setRoomState(roomData);
            
            const infoData = await contestService.getContestDetails(contestId!);
            setContestInfo(infoData);

            const settings = roomData.currentStageSettings;
            if (settings && (settings.type === 'QUIZ' || settings.type === 'SURVEY') && settings.activeRoomId) {
                try {
                    const token = await contestService.getStageAccessToken(contestId!, roomData.roomId);
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
    }, [contestId, showError]);

    useEffect(() => {
        if (contestId) fetchState();
    }, [contestId, fetchState]);

    useContestSocket({ 
        contestId, 
        onRefresh: () => {
            console.log("🔄 Otrzymano sygnał zmiany etapu/stanu!");
            setIsTransitioning(true);
            fetchState().then(() => {
                setIsTransitioning(false);
            });
        }
    });

    // --- HANDLERY ---
    const handleStartContest = async () => {
        if (!roomState?.roomId) return;
        try {
            await contestService.startContest(contestId!, roomState.roomId);
            showSuccess("Konkurs wystartował!");
            fetchState(); 
        } catch (e) { showError("Błąd startu."); }
    };

    const handleNextStage = async () => {
        if (!roomState?.roomId) return;
        if(!window.confirm("Przejść do następnego etapu?")) return;
        try {
            await contestService.nextStage(contestId!, roomState.roomId);
            showSuccess("Zmieniono etap.");
            fetchState(); 
        } catch (e) { showError("Błąd zmiany etapu."); }
    };

    const handleCloseContest = async () => {
        if (!roomState?.roomId) return;
        if (!window.confirm("Czy na pewno chcesz zakończyć CAŁY konkurs? To zamknie sesję dla wszystkich.")) return;
        
        try {
            await contestService.closeContest(contestId!, roomState.roomId);
            showSuccess("Konkurs został zamknięty.");
            navigate(`/contest/${contestId}`);
        } catch (e) { 
            showError("Błąd zamykania konkursu."); 
        }
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
    if (!roomState) return <Container sx={{ mt: 4 }}><Alert severity="error">Błąd sesji.</Alert></Container>;

    if (isTransitioning) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box textAlign="center">
                    <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold">Aktualizacja etapu...</Typography>
                    <Typography color="text.secondary">Pobieranie nowych danych</Typography>
                </Box>
            </Container>
        );
    }

    const isOrganizer = contestInfo?.organizer || false;
    const isJury = contestInfo?.myRoles?.includes('JURY') || false;
    const isLobby = roomState.currentStagePosition === 0;

    if (isFinished) {
        return (
            <ContestFinishedView 
                leaderboard={roomState?.leaderboard || []} 
                currentUserId={currentUserId}
                contestId={contestId!}
            />
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Przycisk Wyjścia */}
            <Box mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/contest/${contestId}`)}>
                    Wyjdź z Live
                </Button>
            </Box>

            {/* ✅ UKŁAD 3-KOLUMNOWY */}
            <Grid container spacing={2} alignItems="stretch">
                
                {/* --- KOLUMNA LEWA: RANKING (3/12) --- */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ height: '100%', maxHeight: 'calc(100vh - 200px)', overflowY: 'hidden' }}>
                        {roomState?.leaderboard && (
                            <ContestLeaderboard 
                                leaderboard={roomState.leaderboard} 
                                currentUserId={currentUserId} 
                            />
                        )}
                    </Box>
                </Grid>

                {/* --- KOLUMNA ŚRODKOWA: SCENA (6/12) --- */}
                <Grid size={{ xs: 12, md: 6 }}>
                    {isLobby ? (
                        <ContestLobbyView isOrganizer={isOrganizer} onStart={handleStartContest} />
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box textAlign="center" mb={2}>
                                 <Typography variant="overline" fontSize="1rem" letterSpacing={3} color="text.secondary">
                                     ETAP {roomState.currentStagePosition}
                                 </Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, minHeight: '50vh' }}>
                                {roomState.currentStageSettings ? (
                                    <ContestStageRenderer 
                                        roomId={roomState.roomId}
                                        settings={roomState.currentStageSettings}
                                        isOrganizer={isOrganizer}
                                        ticket={stageTicket}
                                        contestId={contestId!}
                                        isJury={isJury}
                                    />
                                ) : (
                                    <Paper sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h4" color="text.secondary">Przerwa / Wyniki</Typography>
                                    </Paper>
                                )}
                            </Box>

                            {/* Panel Organizatora (pod sceną) */}
                            {isOrganizer && (
                                <Paper elevation={3} sx={{ mt: 3, p: 2, bgcolor: '#212121', color: 'white', borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" fontWeight="bold">PANEL</Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" color="secondary" onClick={handleNextStage}>
                                                Dalej
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" onClick={handleCloseContest}>
                                                Stop
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            )}
                        </Box>
                    )}
                </Grid>

                {/* --- KOLUMNA PRAWA: CZAT (3/12) --- */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Box sx={{ height: '100%', minHeight: '500px', maxHeight: 'calc(100vh - 200px)' }}>
                         {contestId && <ContestLiveChat contestId={contestId} />}
                    </Box>
                </Grid>

            </Grid>
        </Container>
    );
};

export default ContestLivePage;