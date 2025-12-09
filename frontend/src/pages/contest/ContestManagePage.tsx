import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Paper, Typography, Table, TableBody, TableCell, 
    TableHead, TableRow, Chip, Button, Box, TextField, InputAdornment, 
    CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { debounce } from '@mui/material/utils';

import { contestService } from '@/features/contest/api/contestService';
import type { ContestParticipantDto, ContestRole } from '@/features/contest/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { ContestParticipantManagerDialog } from '@/features/contest/components/ContestParticipantManagerDialog';

const ContestManagePage: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useSnackbar();

    const [participants, setParticipants] = useState<ContestParticipantDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedUser, setSelectedUser] = useState<ContestParticipantDto | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchParticipants = async (query = '') => {
        if (!query.trim()) {
            setParticipants([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await contestService.getParticipants(contestId!, query);
            setParticipants(data.slice(0, 10));
        } catch (e) {
            console.error(e);
            showError("Nie udało się wyszukać uczestników.");
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useMemo(
        () => debounce((query: string) => fetchParticipants(query), 500),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleToggleRole = async (role: ContestRole, hasRole: boolean) => {
        if (!selectedUser) return;
        setIsProcessing(true);
        try {
            await contestService.manageRole(contestId!, selectedUser.userId, role, !hasRole);
            showSuccess(`Rola ${role} zaktualizowana.`);
            
            if (searchQuery) {
                const updatedList = await contestService.getParticipants(contestId!, searchQuery);
                setParticipants(updatedList.slice(0, 10));
                
                const updatedUser = updatedList.find(u => u.id === selectedUser.id);
                if(updatedUser) setSelectedUser(updatedUser);
            }
        } catch (e) {
            showError("Błąd zmiany roli.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteSubmission = async (submissionId: string) => {
        if (!selectedUser) return;
        setIsProcessing(true);
        try {
            await contestService.deleteSubmission(contestId!, submissionId);
            showSuccess("Zgłoszenie odrzucone.");
            
            if (searchQuery) {
                const updatedList = await contestService.getParticipants(contestId!, searchQuery);
                setParticipants(updatedList.slice(0, 10));
                
                const updatedUser = updatedList.find(u => u.id === selectedUser.id);
                if(updatedUser) setSelectedUser(updatedUser);
            }
        } catch (e) {
            showError("Błąd usuwania zgłoszenia.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Wróć
            </Button>
            
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Zarządzanie Uczestnikami</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Wpisz nazwę użytkownika, aby nadać mu uprawnienia lub zarządzać jego zgłoszeniem.
                    </Typography>
                    
                    <TextField 
                        fullWidth
                        size="medium" 
                        placeholder="Szukaj uczestnika po nazwie..." 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                        }}
                    />
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {participants.length > 0 ? (
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Użytkownik</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell align="right">Akcje</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {participants.map((p) => (
                                        <TableRow key={p.id} hover>
                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {p.displayName}
                                                {p.submissionId && <Chip label="Zgłoszenie" size="small" color="primary" variant="outlined" sx={{ ml: 1, fontSize: '0.65rem', height: 20 }} />}
                                            </TableCell>
                                            <TableCell>
                                                {p.roles.map(r => (
                                                    <Chip 
                                                        key={r} 
                                                        label={r} 
                                                        size="small" 
                                                        sx={{ mr: 0.5 }} 
                                                        color={r === 'MODERATOR' ? 'secondary' : r === 'JURY' ? 'warning' : 'default'} 
                                                        variant={r === 'COMPETITOR' ? 'outlined' : 'filled'}
                                                    />
                                                ))}
                                                {p.roles.length === 0 && <Typography variant="caption" color="text.disabled">Brak ról</Typography>}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    startIcon={<SettingsIcon />}
                                                    onClick={() => setSelectedUser(p)}
                                                >
                                                    Edytuj
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fafafa', borderRadius: 2 }}>
                                {searchQuery ? (
                                    <Typography color="text.secondary">Nie znaleziono uczestników pasujących do zapytania.</Typography>
                                ) : (
                                    <Typography color="text.disabled">Wpisz frazę powyżej, aby zobaczyć wyniki.</Typography>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            <ContestParticipantManagerDialog 
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                participant={selectedUser}
                isProcessing={isProcessing}
                onToggleRole={handleToggleRole}
                onDeleteSubmission={handleDeleteSubmission}
            />
        </Container>
    );
};

export default ContestManagePage;