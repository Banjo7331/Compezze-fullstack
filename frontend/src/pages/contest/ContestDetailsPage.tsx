import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Alert, Box } from '@mui/material';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestDetailsDto } from '@/features/contest/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { ContestHeader } from '@/features/contest/components/ContestHeader';
import { ContestActionPanel } from '@/features/contest/components/ContestActionPanel';

const ContestDetailsPage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [contest, setContest] = useState<ContestDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchDetails = async () => {
        try {
            const data = await contestService.getContestDetails(contestId!);
            data.stages.sort((a, b) => a.position - b.position);
            setContest(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (contestId) fetchDetails();
    }, [contestId]);

    const handleJoin = async () => {
        setIsProcessing(true);
        try {
            await contestService.joinContest(contestId!);
            showSuccess("Pomyślnie dołączyłeś do konkursu!");
            fetchDetails();
        } catch (e: any) {
            showError("Nie udało się dołączyć. " + (e.response?.data?.detail || "Sprawdź limity."));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseSubmissions = async () => {
        if (!window.confirm("Czy na pewno zamknąć zgłoszenia? Rozpocznie się faza weryfikacji.")) return;
        
        setIsProcessing(true);
        try {
            await contestService.closeSubmissions(contestId!);
            showSuccess("Zgłoszenia zamknięte. Status: Weryfikacja.");
            fetchDetails(); // Odśwież status na DRAFT
        } catch (e) {
            showError("Błąd zamykania zgłoszeń.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenLobby = async () => {
        if (contest?.organizer) {
            setIsProcessing(true);
            try {
                await contestService.createRoom(contestId!);
                showSuccess("Łączenie z Lobby...");
                navigate(`/contest/${contestId}/live`); // PRZEKIEROWANIE
            } catch (e) {
                showError("Nie udało się otworzyć Lobby.");
            } finally {
                setIsProcessing(false);
            }
        } 
        else {
             navigate(`/contest/${contestId}/live`);
        }
    };

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
    if (!contest) return <Container sx={{ mt: 4 }}><Alert severity="error">Konkurs nie istnieje.</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            
            <ContestHeader contest={contest} />

            <Box sx={{ mb: 4 }}>
                <ContestActionPanel 
                    contest={contest}
                    isProcessing={isProcessing}
                    
                    onJoin={handleJoin}
                    onRefresh={fetchDetails}
                    
                    // onEnterStage={handleEnterStage}
                    onCloseSubmissions={handleCloseSubmissions} 
                    onOpenLobby={handleOpenLobby}

                    onManage={() => navigate(`/contest/${contestId}/manage`)}
                    onReview={() => navigate(`/contest/${contestId}/review`)}
                />
            </Box>
        </Container>
    );
};

export default ContestDetailsPage;