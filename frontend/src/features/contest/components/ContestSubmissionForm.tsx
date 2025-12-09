import React, { useState } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@/shared/ui/Button';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { contestService } from '../api/contestService';

interface Props {
    contestId: string;
    onSuccess: () => void;
}

export const ContestSubmissionForm: React.FC<Props> = ({ contestId, onSuccess }) => {
    const { showSuccess, showError } = useSnackbar();
    
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            await contestService.submitEntry(contestId, file);
            showSuccess("Praca została wysłana! Jesteś teraz Zawodnikiem.");
            setFile(null);
            onSuccess();
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.detail || "Błąd wysyłania pliku.";
            showError(msg);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 3, mt: 2, textAlign: 'center', border: '2px dashed #ccc' }}>
            <Typography variant="h6" gutterBottom>
                Wyślij Swoje Zgłoszenie
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Wgraj zdjęcie lub wideo, aby wziąć udział w konkursie.
            </Typography>

            <Box sx={{ my: 2 }}>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    disabled={isUploading}
                >
                    Wybierz Plik
                    <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                    />
                </Button>
            </Box>

            {file && (
                <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                    Wybrano plik: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Alert>
            )}

            <Button 
                variant="contained" 
                color="success" 
                size="large"
                onClick={handleSubmit}
                disabled={!file || isUploading}
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                fullWidth
            >
                {isUploading ? "Wysyłanie..." : "WYŚLIJ ZGŁOSZENIE"}
            </Button>
        </Paper>
    );
};