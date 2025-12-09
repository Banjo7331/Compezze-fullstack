import React, { useEffect, useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, IconButton, Typography, 
    Box, CircularProgress, Alert 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { surveyService } from '../api/surveyService';
import type { SurveyRoomDetailsResponse } from '../model/types';
import { RoomResultsVisualizer } from './RoomResultsVizualizer';

interface SurveyResultsDialogProps {
    roomId: string | null;
    open: boolean;
    onClose: () => void;
}

export const SurveyResultsDialog: React.FC<SurveyResultsDialogProps> = ({ roomId, open, onClose }) => {
    const [data, setData] = useState<SurveyRoomDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && roomId) {
            const loadResults = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const details = await surveyService.getRoomDetails(roomId);
                    setData(details);
                } catch (err) {
                    setError("Nie udało się pobrać wyników.");
                } finally {
                    setIsLoading(false);
                }
            };
            loadResults();
        }
    }, [open, roomId]);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6">Wyniki Sesji</Typography>
                    {data && (
                        <Typography variant="caption" color="text.secondary">
                            {data.surveyTitle} • Uczestnicy: {data.currentParticipants}
                        </Typography>
                    )}
                </Box>
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : data && data.currentResults ? (
                    <RoomResultsVisualizer results={data.currentResults} />
                ) : (
                    <Typography sx={{ p: 2 }}>Brak danych.</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};