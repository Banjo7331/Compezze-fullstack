import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import type { StageSettingsResponse } from '@/features/contest/model/types';

import { EmbeddedQuizRoom } from './stages/EmbededQuizRoom';
import { EmbeddedSurveyRoom } from './stages/EmbededSurveyRoom';

import { ContestJuryStage } from './stages/ContestJuryStage';
import { ContestPublicVoteStage } from './stages/ContestPublicVoteStage';
import { ContestGenericStage } from './stages/ContestGenericStage';

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

    // --- 1. ETAP: QUIZ ---
    if (settings.type === 'QUIZ') {
        if (!settings.activeRoomId) return <Alert severity="error">Błąd: Brak ID sesji Quizu.</Alert>;
        return (
            <Box sx={{ mt: 2, width: '100%', border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', bgcolor: '#fff', boxShadow: 3 }}>
                <EmbeddedQuizRoom 
                    roomId={settings.activeRoomId} 
                    ticket={ticket || undefined}
                    isHost={isOrganizer}
                />
            </Box>
        );
    }

    // --- 2. ETAP: ANKIETA ---
    if (settings.type === 'SURVEY') {
        if (!settings.activeRoomId) return <Alert severity="error">Błąd: Brak ID sesji Ankiety.</Alert>;
        return (
            <Box sx={{ mt: 2, width: '100%', border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', bgcolor: '#fff', boxShadow: 3, minHeight: 500 }}>
                <EmbeddedSurveyRoom 
                    roomId={settings.activeRoomId}
                    ticket={ticket || undefined}
                    isHost={isOrganizer}
                />
            </Box>
        );
    }

    // --- 3. ETAP: JURY ---
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

    // --- 4. ETAP: PUBLICZNOŚĆ ---
    if (settings.type === 'PUBLIC_VOTE') {
        return (
            <ContestPublicVoteStage 
                contestId={contestId} 
                roomId={roomId}
                settings={settings} 
            />
        );
    }

    // --- 5. INNE (GENERIC) ---
    if (settings.type === 'GENERIC') {
         return <ContestGenericStage name="Przerwa / Informacje" />;
    }

    // Fallback
    return (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
            <HourglassEmptyIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom>Oczekiwanie</Typography>
            <Typography variant="body2" color="text.secondary">
                Konfiguracja etapu w toku...
            </Typography>
        </Paper>
    );
};