import React, { useMemo } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { ContestLeaderboardEntryDto } from '../model/types';

type LeaderboardEntryWithAvatar = ContestLeaderboardEntryDto & {
    avatarUrl?: string;
};

interface Props {
    leaderboard: LeaderboardEntryWithAvatar[];
    currentUserId?: string | null;
}

export const ContestLeaderboard: React.FC<Props> = ({ leaderboard, currentUserId }) => {
    
    const { displayedRows, showSeparator } = useMemo(() => {
        const TOP_LIMIT = 10;
        
        const topPlayers = leaderboard.slice(0, TOP_LIMIT);
        const myEntry = leaderboard.find(p => p.userId === currentUserId);
        const amIInTop = myEntry && myEntry.rank <= TOP_LIMIT;

        if (myEntry && !amIInTop) {
            return {
                displayedRows: [...topPlayers, myEntry],
                showSeparator: true 
            };
        }

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
                        const isLastAndSeparated = showSeparator && index === displayedRows.length - 1;

                        return (
                            <React.Fragment key={entry.userId}>
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
                                        boxShadow: isMe ? 2 : 0 
                                    }}
                                >
                                    {/* ✅ RANGA (Tekst po lewej) */}
                                    <Box 
                                        sx={{ 
                                            minWidth: 24, 
                                            mr: 1, 
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: entry.rank <= 3 ? rankColor : 'text.secondary',
                                            textShadow: entry.rank <= 3 ? '0px 1px 2px rgba(0,0,0,0.3)' : 'none',
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        #{entry.rank}
                                    </Box>

                                    {/* ✅ AVATAR (Obrazek wylosowany) */}
                                    <ListItemAvatar>
                                        <Avatar 
                                            src={entry.avatarUrl}
                                            sx={{ 
                                                bgcolor: rankColor, 
                                                border: entry.rank <= 3 ? `2px solid ${rankColor}` : '1px solid #eee',
                                                color: 'white', 
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {/* Fallback jeśli brak avatara (pierwsza litera) */}
                                            {!entry.avatarUrl && entry.displayName.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>

                                    {/* NICK */}
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography 
                                                    variant="body1" 
                                                    fontWeight={isMe ? 'bold' : 'normal'} 
                                                    noWrap
                                                    sx={{ maxWidth: 120 }}
                                                >
                                                    {entry.displayName}
                                                </Typography>
                                                {isMe && <Chip label="Ty" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                            </Box>
                                        }
                                    />

                                    {/* PUNKTY */}
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