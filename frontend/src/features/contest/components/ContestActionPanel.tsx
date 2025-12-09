import React, { useState } from 'react';
import { Paper, Typography, Stack, Alert, Box, Divider, Chip, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Button } from '@/shared/ui/Button';

// Ikony
import AddTaskIcon from '@mui/icons-material/AddTask';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LockClockIcon from '@mui/icons-material/LockClock'; 
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PodcastsIcon from '@mui/icons-material/Podcasts'

import type { ContestDetailsDto } from '../model/types';
import { ContestSubmissionForm } from './ContestSubmissionForm';
import { contestService } from '../api/contestService'; 
import { useSnackbar } from '@/app/providers/SnackbarProvider';

interface Props {
    contest: ContestDetailsDto;
    
    // Akcje
    onJoin: () => void;
    onManage: () => void;
    onReview: () => void;
    onRefresh: () => void; 
    onCloseSubmissions?: () => void;
    onOpenLobby: () => void;
    
    isProcessing: boolean;
}

export const ContestActionPanel: React.FC<Props> = ({ 
    contest, onJoin, onManage, onReview, onRefresh, onCloseSubmissions, onOpenLobby, isProcessing 
}) => {
    
    const { showSuccess, showError } = useSnackbar();
    const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- 1. ANALIZA RÓL ---
    const myRoles = contest.myRoles || [];
    const isOrganizer = contest.organizer;
    const isModerator = myRoles.includes('MODERATOR');
    const isStaff = isOrganizer || isModerator;
    
    const isJury = myRoles.includes('JURY');
    const isCompetitor = myRoles.includes('COMPETITOR');
    const isParticipant = contest.participant;

    // --- 2. ANALIZA STANU ---
    // CREATED = Faza zgłoszeń
    // DRAFT = Faza weryfikacji
    const isSubmissionPhase = contest.status === 'CREATED';
    const isVerificationPhase = contest.status === 'DRAFT';
    const isContestActive = contest.status === 'ACTIVE';
    const isFinished = contest.status === 'FINISHED';

    // --- HANDLER USUWANIA ---
    const handleWithdraw = async () => {
        if (!window.confirm("Czy na pewno chcesz wycofać swoje zgłoszenie? Ta operacja jest nieodwracalna.")) return;
        
        setIsDeleting(true);
        try {
            await contestService.withdrawMySubmission(contest.id);
            showSuccess("Zgłoszenie zostało wycofane.");
            onRefresh(); 
        } catch (e) {
            showError("Nie udało się wycofać zgłoszenia.");
        } finally {
            setIsDeleting(false);
        }
    };

    // =========================================================
    // WIDOK 1: STAFF (ORGANIZATOR / MODERATOR)
    // =========================================================
    if (isStaff) {
        return (
            <Paper elevation={6} sx={{ p: 3, borderLeft: '6px solid #9c27b0', bgcolor: '#fdfbff' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <AdminPanelSettingsIcon color="secondary" fontSize="large" />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {isOrganizer ? "Panel Organizatora" : "Panel Moderatora"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Zarządzanie przebiegiem konkursu.
                        </Typography>
                    </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" color="secondary" onClick={onManage} disabled={isProcessing}>
                        Ustawienia i Uczestnicy
                    </Button>
                    
                    {isSubmissionPhase && onCloseSubmissions && (
                        <Button 
                            variant="contained" 
                            color="warning" 
                            startIcon={<LockClockIcon />}
                            onClick={onCloseSubmissions}
                            disabled={isProcessing}
                        >
                            Zamknij Zgłoszenia
                        </Button>
                    )}

                    {!isFinished && onOpenLobby && (
                        <Button 
                            variant="contained" 
                            color="error"
                            startIcon={isContestActive ? <PlayArrowIcon /> : <PodcastsIcon />}
                            onClick={onOpenLobby}
                            disabled={isProcessing}
                            sx={{ ml: 'auto' }} // Przesuń na prawo
                        >
                            {isContestActive ? "Wróć do Panelu Live" : "Otwórz Lobby / Start"}
                        </Button>
                    )}

                    <Button variant="outlined" startIcon={<RateReviewIcon />} onClick={onReview}>
                        Weryfikacja Zgłoszeń
                    </Button>
                </Stack>
                
                {isVerificationPhase && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Zgłoszenia zamknięte. Trwa weryfikacja prac przed startem konkursu.
                    </Alert>
                )}
            </Paper>
        );
    }

    // =========================================================
    // WIDOK 3: UCZESTNIK (ZAPISANY)
    // =========================================================
    if (isParticipant) {
        return (
            <Paper elevation={3} sx={{ p: 4, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', textAlign: 'center' }}>
                
                {/* Jeśli konkurs TRWA -> Pokaż przycisk wejścia na LIVE */}
                {isContestActive ? (
                    <>
                        <Typography variant="h5" color="success.main" fontWeight="bold" gutterBottom>
                            🔴 KONKURS NA ŻYWO
                        </Typography>
                        <Typography paragraph>Wydarzenie wystartowało. Dołącz do transmisji.</Typography>
                        
                        {onOpenLobby && (
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large"
                                startIcon={<PlayArrowIcon />}
                                onClick={onOpenLobby} // Dla uczestnika to oznacza "Wejdź do pokoju"
                                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                            >
                                DOŁĄCZ DO LIVE
                            </Button>
                        )}
                    </>
                ) : (
                    // Jeśli jeszcze nie trwa -> Standardowy panel zgłoszeń
                    <>
                        {isCompetitor ? (
                            <Box>
                                <CheckCircleIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h6" color="success.main" fontWeight="bold" gutterBottom>
                                    Zgłoszenie Przesłane
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Powodzenia w konkursie!
                                </Typography>
                                {isSubmissionPhase && (
                                    <Button variant="text" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleWithdraw} disabled={isDeleting}>
                                        {isDeleting ? "Wycofywanie..." : "Wycofaj Zgłoszenie"}
                                    </Button>
                                )}
                            </Box>
                        ) : (
                            <>
                                <Typography variant="h6" gutterBottom>Jesteś uczestnikiem</Typography>
                                {isSubmissionPhase ? (
                                    <Button variant="contained" color="success" size="large" startIcon={<CloudUploadIcon />} onClick={() => setIsSubmissionDialogOpen(true)} sx={{ px: 4 }}>
                                        Prześlij Pracę Konkursową
                                    </Button>
                                ) : (
                                    <Alert severity="info" icon={<HourglassEmptyIcon />}>
                                        {isVerificationPhase ? "Trwa weryfikacja prac." : "Czekaj na start."}
                                    </Alert>
                                )}
                                <Dialog open={isSubmissionDialogOpen} onClose={() => setIsSubmissionDialogOpen(false)} maxWidth="sm" fullWidth>
                                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        Wyślij Zgłoszenie
                                        <IconButton onClick={() => setIsSubmissionDialogOpen(false)}><CloseIcon /></IconButton>
                                    </DialogTitle>
                                    <DialogContent dividers>
                                        <ContestSubmissionForm contestId={contest.id} onSuccess={() => { setIsSubmissionDialogOpen(false); onRefresh(); }} />
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </>
                )}
            </Paper>
        );
    }

    // =========================================================
    // WIDOK 4: GOŚĆ (NIEZAPISANY)
    // =========================================================
    const isFull = contest.participantLimit > 0 && contest.currentParticipantsCount >= contest.participantLimit;
    const isClosed = contest.status === 'FINISHED';

    if (isClosed) return <Alert severity="warning">Konkurs zakończony.</Alert>;
    if (isFull) return <Alert severity="error">Brak miejsc.</Alert>;

    return (
        <Paper elevation={6} sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">Dołącz do rywalizacji!</Typography>
            <Button 
                variant="contained" 
                size="large" 
                onClick={onJoin} 
                disabled={isProcessing}
                startIcon={<AddTaskIcon />}
                sx={{ px: 8, py: 2, fontSize: '1.2rem', borderRadius: 50 }}
            >
                {isProcessing ? "Zapisywanie..." : "ZAPISZ SIĘ TERAZ"}
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                (Wymagane zalogowanie)
            </Typography>
        </Paper>
    );
};