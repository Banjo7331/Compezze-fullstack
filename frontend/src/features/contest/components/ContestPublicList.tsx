import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Button, CircularProgress, Stack, Pagination, 
    Chip, Alert, Grid, TextField, MenuItem, InputAdornment, Container 
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import { useNavigate } from 'react-router-dom';
import { contestService } from '@/features/contest/api/contestService'; // Używamy serwisu bezpośrednio
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ContestCategory } from '@/features/contest/model/types'; // Twój enum

export const ContestPublicList: React.FC = () => {
    const navigate = useNavigate();

    // --- STANY ---
    const [contests, setContests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Paginacja
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Filtry
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<ContestCategory | ''>('');
    const [statusFilter, setStatusFilter] = useState<'CREATED' | 'LIVE' | ''>('');

    // Debounce dla wyszukiwarki (czekamy 500ms)
    const debouncedSearch = useDebounce(search, 500);

    // --- POBIERANIE DANYCH ---
    useEffect(() => {
        const fetchContests = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await contestService.getPublicContests({
                    page: page - 1, // API liczy od 0, UI od 1
                    size: 10,
                    sort: 'startDate,asc',
                    search: debouncedSearch,
                    category: category,
                    status: statusFilter
                });
                
                setContests(data.content || []);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error(err);
                setError("Nie udało się pobrać listy konkursów.");
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, [page, debouncedSearch, category, statusFilter]);

    // Reset strony na 1, gdy user zmienia filtry
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, statusFilter]);

    // --- HANDLERS ---
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // --- RENDER ---
    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            
            {/* 1. SEKCJA FILTRÓW (Nowość) */}
            <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: '#fff' }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Szukaj */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Szukaj po nazwie..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Kategoria */}
                    <Grid size={{ xs: 6, md: 4 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Kategoria"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                        >
                            <MenuItem value="">Wszystkie</MenuItem>
                            {Object.values(ContestCategory).map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><FilterAltIcon fontSize="small" /></InputAdornment>
                            }}
                        >
                            <MenuItem value="">Wszystkie</MenuItem>
                            <MenuItem value="CREATED">Nadchodzące (Zapisy)</MenuItem>
                            <MenuItem value="LIVE">Trwające (Live)</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* 2. LOADING & ERROR */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : contests.length === 0 ? (
                // 3. BRAK WYNIKÓW
                <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#fafafa', borderRadius: 2 }}>
                    <SearchOffIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Nie znaleziono konkursów
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Zmień kryteria wyszukiwania, aby zobaczyć więcej wyników.
                    </Typography>
                </Box>
            ) : (
                // 4. LISTA KONKURSÓW (Twój styl)
                <Stack spacing={2}>
                    {contests.map((contest) => (
                        <Paper 
                            key={contest.id} 
                            elevation={2} 
                            sx={{ 
                                p: 3, 
                                borderLeft: '6px solid #9c27b0', // Twój fioletowy akcent
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                gap: 2,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                    <EmojiEventsIcon color="secondary" fontSize="small" />
                                    <Typography variant="h6" fontWeight="bold">
                                        {contest.name}
                                    </Typography>
                                    {/* Opcjonalny Chip statusu */}
                                    {contest.status === 'LIVE' && (
                                        <Chip label="LIVE" color="error" size="small" sx={{ ml: 1, fontWeight: 'bold', height: 20 }} />
                                    )}
                                </Stack>
                                
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
                                    <Chip 
                                        label={contest.category} 
                                        size="small" 
                                        variant="outlined" 
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                        <CalendarTodayIcon fontSize="inherit" />
                                        <Typography variant="caption">
                                            Start: {new Date(contest.startDate).toLocaleDateString()} {new Date(contest.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                color="secondary"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate(`/contest/${contest.id}`)}
                                sx={{ minWidth: '120px', alignSelf: { xs: 'stretch', sm: 'auto' } }}
                            >
                                Zobacz
                            </Button>
                        </Paper>
                    ))}
                </Stack>
            )}

            {/* 5. PAGINACJA */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange} 
                        color="secondary" 
                    />
                </Box>
            )}
        </Container>
    );
};