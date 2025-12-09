import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Stack, Typography, InputAdornment
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';

interface StartQuizRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (config: { maxParticipants: number, timePerQuestion: number }) => void;
    isLoading?: boolean;
}

export const StartQuizRoomDialog: React.FC<StartQuizRoomDialogProps> = ({ open, onClose, onConfirm, isLoading }) => {
    const [maxParticipants, setMaxParticipants] = useState<string>('100');
    const [timePerQuestion, setTimePerQuestion] = useState<string>('30');

    const [participantsError, setParticipantsError] = useState<string | null>(null);
    const [timeError, setTimeError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setMaxParticipants('100');
            setTimePerQuestion('30');
            setParticipantsError(null);
            setTimeError(null);
        }
    }, [open]);

    const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMaxParticipants(val);
        const num = Number(val);
        if (!val) setParticipantsError("Pole wymagane");
        else if (isNaN(num) || num < 2) setParticipantsError("Min 2 graczy");
        else if (num > 1000) setParticipantsError("Max 1000 graczy");
        else setParticipantsError(null);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTimePerQuestion(val);
        const num = Number(val);
        if (!val) setTimeError("Pole wymagane");
        else if (isNaN(num) || num < 5) setTimeError("Min 5 sekund");
        else if (num > 300) setTimeError("Max 300 sekund (5 min)");
        else setTimeError(null);
    };

    const handleSubmit = () => {
        if (participantsError || timeError || !maxParticipants || !timePerQuestion) return;
        
        onConfirm({ 
            maxParticipants: Number(maxParticipants),
            timePerQuestion: Number(timePerQuestion)
        });
    };

    const isValid = !participantsError && !timeError && maxParticipants !== '' && timePerQuestion !== '';

    return (
        <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon color="success" />
                Uruchom Grę
            </DialogTitle>
            
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Skonfiguruj parametry rozgrywki.
                    </Typography>

                    <TextField
                        label="Czas na jedno pytanie (sekundy)"
                        type="number"
                        fullWidth
                        value={timePerQuestion}
                        onChange={handleTimeChange}
                        error={!!timeError}
                        helperText={timeError || "Ile czasu gracze mają na odpowiedź?"}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><TimerIcon/></InputAdornment>,
                            inputProps: { min: 5, max: 300 } 
                        }}
                    />

                    <TextField
                        label="Limit graczy"
                        type="number"
                        fullWidth
                        value={maxParticipants}
                        onChange={handleParticipantsChange}
                        error={!!participantsError} 
                        helperText={participantsError || "Maksymalna liczba uczestników."}
                        InputProps={{ inputProps: { min: 2, max: 1000 } }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={isLoading} color="inherit">Anuluj</Button>
                <Button onClick={handleSubmit} variant="contained" color="success" disabled={isLoading || !isValid}>
                    {isLoading ? "Tworzenie..." : "Utwórz Lobby"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};