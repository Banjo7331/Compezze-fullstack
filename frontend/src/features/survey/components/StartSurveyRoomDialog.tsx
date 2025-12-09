import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Stack, Typography, Box
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface StartRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (config: { duration: number, maxParticipants: number }) => void;
    isLoading?: boolean;
}

export const StartSurveyRoomDialog: React.FC<StartRoomDialogProps> = ({ open, onClose, onConfirm, isLoading }) => {
    const [duration, setDuration] = useState<string>('15');
    const [maxParticipants, setMaxParticipants] = useState<string>('100');

    const [durationError, setDurationError] = useState<string | null>(null);
    const [participantsError, setParticipantsError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setDuration('90');
            setMaxParticipants('100');
            setDurationError(null);
            setParticipantsError(null);
        }
    }, [open]);

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDuration(val);

        const num = Number(val);
        if (!val) {
            setDurationError("Pole wymagane");
        } else if (isNaN(num) || num < 1) {
            setDurationError("Minimum 1 minuta");
        } else if (num > 90) {
            setDurationError("Maksymalnie 90 minut");
        } else {
            setDurationError(null);
        }
    };

    const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMaxParticipants(val);

        const num = Number(val);
        if (!val) {
            setParticipantsError("Pole wymagane");
        } else if (isNaN(num) || num < 1) {
            setParticipantsError("Minimum 1 uczestnik");
        } else if (num > 1000) {
            setParticipantsError("Maksymalnie 1000 uczestników (limit serwera)");
        } else {
            setParticipantsError(null); 
        }
    };

    const handleSubmit = () => {
        if (durationError || participantsError || !duration || !maxParticipants) return;

        onConfirm({ 
            duration: Number(duration), 
            maxParticipants: Number(maxParticipants) 
        });
    };

    const isValid = !durationError && !participantsError && duration !== '' && maxParticipants !== '';

    return (
        <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon color="success" />
                Uruchom Nową Sesję
            </DialogTitle>
            
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Skonfiguruj parametry pokoju. Po uruchomieniu sesja będzie aktywna przez określony czas.
                    </Typography>

                    <TextField
                        label="Czas trwania (minuty)"
                        type="number"
                        fullWidth
                        value={duration}
                        onChange={handleDurationChange}
                        
                        error={!!durationError}
                        helperText={durationError || "Domyślnie 90 minut. Po tym czasie pokój zostanie zamknięty."}
                        
                        InputProps={{ inputProps: { min: 1, max: 90 } }}
                    />

                    <TextField
                        label="Limit uczestników"
                        type="number"
                        fullWidth
                        value={maxParticipants}
                        onChange={handleParticipantsChange}
                        
                        error={!!participantsError}
                        helperText={participantsError || "Maksymalna liczba osób, które mogą dołączyć (max 1000)."}
                        
                        InputProps={{ inputProps: { min: 1, max: 1000 } }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="inherit">
                    Anuluj
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="success"
                    disabled={isLoading || !isValid}
                >
                    {isLoading ? "Uruchamianie..." : "Start"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};