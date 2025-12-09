import React from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box 
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { LeaderboardEntryDto } from '../model/socket.types';

interface Props {
    leaderboard: LeaderboardEntryDto[];
}

export const QuizLeaderboardTable: React.FC<Props> = ({ leaderboard }) => {
    if (!leaderboard || leaderboard.length === 0) {
        return <Typography align="center" color="text.secondary" sx={{ p: 2 }}>Brak danych o wynikach.</Typography>;
    }

    const getIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell align="center" width="15%">Miejsce</TableCell>
                        <TableCell>Gracz</TableCell>
                        <TableCell align="right">Punkty</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leaderboard.map((entry) => (
                        <TableRow 
                            key={entry.userId || entry.rank}
                            sx={{ 
                                bgcolor: entry.rank <= 3 ? 'rgba(255, 215, 0, 0.05)' : 'inherit' 
                            }}
                        >
                            <TableCell align="center" sx={{ fontSize: '1.2rem' }}>
                                {getIcon(entry.rank)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: entry.rank <= 3 ? 'bold' : 'normal' }}>
                                {entry.nickname}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {entry.score}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};