import React from 'react';
import { Box, Typography, Paper, Chip, Stack, Stepper, Step, StepLabel, Grid } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import type { ContestDetailsDto } from '../model/types';

export const ContestHeader: React.FC<{ contest: ContestDetailsDto }> = ({ contest }) => {
    
    const activeStep = contest.status === 'FINISHED' ? contest.stages.length : -1;

    return (
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(to right, #ffffff, #f3e5f5)' }}>
            <Grid container spacing={2}>
                
                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Chip label={contest.category} color="secondary" variant="outlined" size="small" />
                        
                        <Chip 
                            label={contest.status === 'ACTIVE' ? 'TRWA' : contest.status} 
                            color={contest.status === 'ACTIVE' ? 'success' : contest.status === 'DRAFT' ? 'warning' : 'default'} 
                            size="small" 
                        />
                        
                        {contest.private && <Chip icon={<LockIcon fontSize="small" />} label="Prywatny" size="small" />}
                    </Stack>
                    
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {contest.name}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '800px' }}>
                        {contest.description}
                    </Typography>

                    <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <PersonIcon fontSize="small" />
                            <Typography variant="body2">
                                {contest.currentParticipantsCount} / {contest.participantLimit || '∞'} uczestników
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <CalendarTodayIcon fontSize="small" />
                            <Typography variant="body2">
                                Start: {new Date(contest.startDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                         {contest.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <LocationOnIcon fontSize="small" />
                                <Typography variant="body2">{contest.location}</Typography>
                            </Box>
                        )}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 2, py: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 2, overflowX: 'auto' }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {contest.stages.map((stage) => (
                                <Step key={stage.id}>
                                    <StepLabel>
                                        <Typography variant="caption" display="block" fontWeight="bold">{stage.type}</Typography>
                                        <Typography variant="caption">{stage.name}</Typography>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};