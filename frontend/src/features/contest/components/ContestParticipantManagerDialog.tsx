import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Typography, Chip, Stack, Box, Divider, Alert 
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GavelIcon from '@mui/icons-material/Gavel';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { ContestParticipantDto, ContestRole } from '../model/types';

interface Props {
    open: boolean;
    onClose: () => void;
    participant: ContestParticipantDto | null;
    onToggleRole: (role: ContestRole, hasRole: boolean) => void;
    onDeleteSubmission: (submissionId: string) => void;
    isProcessing: boolean;
}

const ROLES_CONFIG: { role: ContestRole, label: string, icon: React.ReactElement, color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }[] = [
    { role: 'MODERATOR', label: 'Moderator', icon: <VerifiedUserIcon />, color: 'secondary' },
    { role: 'JURY', label: 'Jury (Sędzia)', icon: <GavelIcon />, color: 'warning' },
    { role: 'COMPETITOR', label: 'Zawodnik', icon: <EmojiEventsIcon />, color: 'info' }, 
];

export const ContestParticipantManagerDialog: React.FC<Props> = ({ 
    open, onClose, participant, onToggleRole, onDeleteSubmission, isProcessing 
}) => {
    if (!participant) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                Zarządzaj Uczestnikiem
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {participant.displayName}
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
                
                <Typography variant="overline" display="block" gutterBottom color="text.secondary">
                    ROLE I UPRAWNIENIA
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {ROLES_CONFIG.map((config) => {
                        const hasRole = participant.roles.includes(config.role);
                        const isCompetitor = config.role === 'COMPETITOR';

                        return (
                            <Chip 
                                key={config.role}
                                icon={config.icon}
                                label={config.label}
                                color={hasRole ? config.color : 'default'}
                                variant={hasRole ? 'filled' : 'outlined'}
                                onClick={() => !isCompetitor && onToggleRole(config.role, hasRole)}
                                sx={{ 
                                    opacity: hasRole ? 1 : 0.6,
                                    cursor: isCompetitor ? 'default' : 'pointer',
                                    fontWeight: hasRole ? 'bold' : 'normal'
                                }}
                            />
                        );
                    })}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="overline" display="block" gutterBottom color="text.secondary">
                    ZGŁOSZENIE KONKURSOWE
                </Typography>

                {participant.submissionId ? (
                    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" fontWeight="bold">Status:</Typography>
                            <Chip 
                                label={participant.submissionStatus} 
                                size="small" 
                                color={participant.submissionStatus === 'APPROVED' ? 'success' : participant.submissionStatus === 'REJECTED' ? 'error' : 'default'} 
                            />
                        </Stack>
                        
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                            ID: {participant.submissionId}
                        </Typography>
                        
                        <Button 
                            variant="outlined" 
                            color="error" 
                            size="small" 
                            startIcon={<DeleteIcon />}
                            fullWidth
                            onClick={() => {
                                if(window.confirm("Czy na pewno usunąć (odrzucić) zgłoszenie? Użytkownik straci rolę ZAWODNIKA.")) {
                                    onDeleteSubmission(participant.submissionId!);
                                }
                            }}
                            disabled={isProcessing}
                        >
                            Usuń Zgłoszenie
                        </Button>
                    </Box>
                ) : (
                    <Alert severity="info" icon={false} sx={{ py: 0 }}>
                        Użytkownik nie przesłał jeszcze zgłoszenia.
                    </Alert>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Zamknij</Button>
            </DialogActions>
        </Dialog>
    );
};