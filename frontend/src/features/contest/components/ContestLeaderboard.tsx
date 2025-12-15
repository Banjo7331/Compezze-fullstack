import React, { useMemo } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ContestLeaderboardEntryDto } from '../model/types';

interface Props {
    leaderboard: ContestLeaderboardEntryDto[];
    currentUserId?: string | null;
}

export const ContestLeaderboard: React.FC<Props> = ({ leaderboard, currentUserId }) => {
    
    // Logika wyświetlania: Top 10 + Ty
    const { displayedRows, showSeparator } = useMemo(() => {
        const TOP_LIMIT = 10;
        
        // 1. Bierzemy czołówkę
        const topPlayers = leaderboard.slice(0, TOP_LIMIT);
        
        // 2. Szukamy currentusera
        const myEntry = leaderboard.find(p => p.userId === currentUserId);
        
        // 3. Sprawdzamy czy jestem w czołówce
        const amIInTop = myEntry && myEntry.rank <= TOP_LIMIT;

        // Jeśli jestem poza topką, musimy mnie dokleić
        if (myEntry && !amIInTop) {
            return {
                displayedRows: [...topPlayers, myEntry], // Top 10 + Ja
                showSeparator: true // Pokaż kropki przed ostatnim elementem
            };
        }

        // Jeśli jestem w topce lub mnie nie ma (jestem adminem/widzem)
        return {
            displayedRows: topPlayers,
            showSeparator: false
        };
    }, [leaderboard, currentUserId]);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; // Złoto
            case 2: return '#C0C0C0'; // Srebro
            case 3: return '#CD7F32'; // Brąz
            default: return '#e0e0e0'; // Szary
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <EmojiEventsIcon color="warning" fontSize="large" />
                <Typography variant="h5" fontWeight="bold">
                    Top Wyniki
                </Typography>
            </Box>
            
            <Divider sx={{ mb: 1 }} />

            <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
                {displayedRows.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
                        Brak wyników.
                    </Typography>
                ) : (
                    displayedRows.map((entry, index) => {
                        const isMe = entry.userId === currentUserId;
                        const rankColor = getRankColor(entry.rank);
                        
                        // Czy to jest ten "doklejony" wiersz (ostatni, gdy jest separator)?
                        const isLastAndSeparated = showSeparator && index === displayedRows.length - 1;

                        return (
                            <React.Fragment key={entry.userId}>
                                {/* Separator (kropki) przed Twoim wynikiem */}
                                {isLastAndSeparated && (
                                    <Box sx={{ textAlign: 'center', py: 1, color: 'text.disabled' }}>
                                        <MoreHorizIcon />
                                    </Box>
                                )}

                                <ListItem 
                                    sx={{ 
                                        bgcolor: isMe ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                        borderRadius: 2,
                                        mb: 1,
                                        border: isMe ? '2px solid #1976d2' : '1px solid transparent',
                                        // Wyróżnienie jeśli to Twój "odległy" wynik
                                        boxShadow: isMe ? 2 : 0 
                                    }}
                                >
                                    {/* Ranga (Kółeczko) */}
                                    <ListItemAvatar>
                                        <Avatar 
                                            sx={{ 
                                                bgcolor: rankColor, 
                                                color: entry.rank <= 3 ? 'white' : 'black', 
                                                fontWeight: 'bold',
                                                width: 32, height: 32, fontSize: '0.9rem'
                                            }}
                                        >
                                            {entry.rank}
                                        </Avatar>
                                    </ListItemAvatar>

                                    {/* Nick */}
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography 
                                                    variant="body1" 
                                                    fontWeight={isMe ? 'bold' : 'normal'} 
                                                    noWrap
                                                    sx={{ maxWidth: 140 }}
                                                >
                                                    {entry.displayName}
                                                </Typography>
                                                {isMe && <Chip label="Ty" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                            </Box>
                                        }
                                    />

                                    {/* Punkty */}
                                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                                        {entry.totalScore}
                                    </Typography>
                                </ListItem>
                            </React.Fragment>
                        );
                    })
                )}
            </List>
        </Paper>
    );
};