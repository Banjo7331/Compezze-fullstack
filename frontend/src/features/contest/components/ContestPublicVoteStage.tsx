import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, Chip } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

import { contestService } from '@/features/contest/api/contestService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import type { SubmissionDto, StageSettingsResponse } from '@/features/contest/model/types';

interface Props {
    contestId: string;
    settings: StageSettingsResponse & { type: 'PUBLIC_VOTE' };
}

export const ContestPublicVoteStage: React.FC<Props> = ({ contestId, settings }) => {
    const { showSuccess, showError } = useSnackbar();
    const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
    
    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetch = async () => {
            try {
                const list: any = await contestService.getSubmissionsForReview(contestId, 'APPROVED');
                setSubmissions(Array.isArray(list) ? list : list.content);
            } catch (e) { console.error(e); }
        };
        fetch();
    }, [contestId]);

    const handleVote = async (subId: string) => {
        try {
            await contestService.vote(contestId, settings.stageId, subId, 1);
            showSuccess("Głos oddany!");
            setVotedIds(prev => new Set(prev).add(subId));
        } catch (e) {
            showError("Już głosowałeś na tę pracę.");
            setVotedIds(prev => new Set(prev).add(subId));
        }
    };

    return (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <PublicIcon color="info" sx={{ fontSize: 50 }} />
                <Typography variant="h4" color="info.main" fontWeight="bold">Głosowanie Publiczności</Typography>
                <Typography>Wybierz swoje ulubione prace!</Typography>
            </Box>

            <Grid container spacing={3}>
                {submissions.map((sub) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sub.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={sub.contentUrl || "https://via.placeholder.com/400"}
                                sx={{ bgcolor: '#eee', objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" noWrap>{sub.participantName}</Typography>
                                <Button 
                                    variant={votedIds.has(sub.id) ? "outlined" : "contained"}
                                    color="info"
                                    fullWidth
                                    startIcon={<ThumbUpIcon />}
                                    onClick={() => handleVote(sub.id)}
                                    disabled={votedIds.has(sub.id)}
                                    sx={{ mt: 2 }}
                                >
                                    {votedIds.has(sub.id) ? "Głos Oddany" : "Głosuj"}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};