import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, CardMedia, Button, 
    Slider, Stack, Alert, CircularProgress, Paper
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { contestService } from '@/features/contest/api/contestService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { SubmissionDto, StageSettingsResponse } from '@/features/contest/model/types';

interface Props {
    contestId: string;
    roomId: string;
    settings: StageSettingsResponse & { type: 'JURY_VOTE' };
    isOrganizer: boolean;
    isJury: boolean;
}

export const ContestJuryStage: React.FC<Props> = ({ contestId, roomId, settings, isOrganizer, isJury }) => {
    const { showSuccess, showError } = useSnackbar();
    
    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    const [currentSubIndex, setCurrentSubIndex] = useState(0); 
    const [score, setScore] = useState<number>(settings.maxScore / 2);
    const [hasVoted, setHasVoted] = useState(false);

    // ✅ NOWY STAN: Link do mediów i loader
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaLoading, setMediaLoading] = useState(false);

    // 1. Pobieramy zgłoszenia (APPROVED only)
    useEffect(() => {
        const fetch = async () => {
            try {
                const list: any = await contestService.getSubmissionsForReview(contestId, 'APPROVED');
                const data = Array.isArray(list) ? list : list.content;
                setSubmissions(data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();
    }, [contestId]);

    const currentSubmission = submissions[currentSubIndex];

    // ✅ 2. Pobieranie URL do pliku (MinIO) przy każdej zmianie pracy
    useEffect(() => {
        if (!currentSubmission?.id) return;

        let isMounted = true;
        setMediaLoading(true);
        setMediaUrl(null); // Reset URL przy zmianie slajdu

        const fetchMedia = async () => {
            try {
                // Pobieramy tymczasowy link do pliku
                const url = await contestService.getSubmissionMediaUrl(contestId, currentSubmission.id);
                if (isMounted) {
                    setMediaUrl(url);
                }
            } catch (e) {
                console.error("Błąd ładowania multimediów:", e);
            } finally {
                if (isMounted) setMediaLoading(false);
            }
        };

        fetchMedia();

        return () => { isMounted = false; };
    }, [contestId, currentSubmission?.id]);

    // 3. Handler Głosu
    const handleVote = async () => {
        if (!currentSubmission) return;
        try {
            await contestService.vote(contestId, roomId, settings.stageId, currentSubmission.id, score);
            showSuccess(`Oddano głos: ${score}`);
            setHasVoted(true);
        } catch (e) {
            showError("Błąd głosowania (może już oceniałeś?).");
        }
    };

    // 4. Handler Hosta (Następna praca)
    const handleNextSubmission = () => {
        if (currentSubIndex < submissions.length - 1) {
            setCurrentSubIndex(prev => prev + 1);
            setHasVoted(false);
            setScore(settings.maxScore / 2);
        }
    };

    const handlePrevSubmission = () => {
        if (currentSubIndex > 0) {
            setCurrentSubIndex(prev => prev - 1);
            setHasVoted(false);
        }
    };

    if (submissions.length === 0) {
        return <Alert severity="info">Brak zatwierdzonych prac do oceny.</Alert>;
    }

    if (!currentSubmission) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    return (
        <Box>
            {/* NAGŁÓWEK ETAPU */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff3e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <GavelIcon color="warning" fontSize="large" />
                <Box flexGrow={1}>
                    <Typography variant="h5" fontWeight="bold">Głosowanie Jury</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ocena pracy {currentSubIndex + 1} z {submissions.length}
                    </Typography>
                </Box>
                {isOrganizer && (
                    <Stack direction="row" spacing={1}>
                        <Button onClick={handlePrevSubmission} disabled={currentSubIndex === 0}>Poprzednia</Button>
                        <Button variant="contained" onClick={handleNextSubmission} disabled={currentSubIndex === submissions.length - 1} endIcon={<PlayArrowIcon />}>
                            Następna Praca
                        </Button>
                    </Stack>
                )}
            </Paper>

            <Grid container spacing={4}>
                
                {/* --- LEWA STRONA: PREZENTACJA PRACY (Z poprawionym obrazkiem) --- */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card elevation={4}>
                        <Box sx={{ 
                            height: 400, 
                            bgcolor: 'black', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {mediaLoading ? (
                                <CircularProgress color="warning" />
                            ) : mediaUrl ? (
                                <CardMedia
                                    component={mediaUrl.endsWith('.mp4') ? 'video' : 'img'} // Proste wykrywanie wideo po rozszerzeniu
                                    image={mediaUrl}
                                    controls={mediaUrl.endsWith('.mp4')}
                                    autoPlay={mediaUrl.endsWith('.mp4')}
                                    sx={{ 
                                        height: '100%', 
                                        width: '100%', 
                                        objectFit: 'contain' // Ważne: skaluje obrazek bez ucinania
                                    }}
                                />
                            ) : (
                                <Typography color="error">Nie udało się załadować podglądu</Typography>
                            )}
                        </Box>
                        
                        <CardContent>
                            <Typography variant="h4" gutterBottom>{currentSubmission.participantName}</Typography>
                            <Typography variant="body1" color="text.secondary">
                                {currentSubmission.comment || "Brak opisu."}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* --- PRAWA STRONA: PANEL OCENY --- */}
                <Grid size={{ xs: 12, md: 5 }}>
                    {isJury ? (
                        <Paper elevation={3} sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom align="center">TWOJA OCENA</Typography>
                            
                            <Box sx={{ py: 4, px: 2 }}>
                                <Slider
                                    value={score}
                                    onChange={(_, v) => setScore(v as number)}
                                    step={1}
                                    min={1}
                                    max={settings.maxScore}
                                    valueLabelDisplay="on"
                                    disabled={hasVoted}
                                    marks
                                    sx={{ 
                                        color: 'warning.main',
                                        '& .MuiSlider-valueLabel': { fontSize: '1.5rem', fontWeight: 'bold' } 
                                    }}
                                />
                            </Box>

                            <Button 
                                variant="contained" 
                                color="warning" 
                                size="large"
                                startIcon={<RateReviewIcon />}
                                onClick={handleVote}
                                disabled={hasVoted}
                                fullWidth
                                sx={{ py: 2, fontSize: '1.2rem' }}
                            >
                                {hasVoted ? "OCENIONO" : "ZATWIERDŹ OCENĘ"}
                            </Button>
                            
                            {hasVoted && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Głos przyjęty. Czekaj na następną pracę.
                                </Alert>
                            )}
                        </Paper>
                    ) : (
                        // WIDOK DLA WIDZÓW
                        <Paper elevation={1} sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress color="warning" />
                            <Typography variant="h6" sx={{ mt: 2 }}>Jury ocenia pracę...</Typography>
                            <Typography variant="body2" color="text.secondary">Zaczekaj na wyniki.</Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};