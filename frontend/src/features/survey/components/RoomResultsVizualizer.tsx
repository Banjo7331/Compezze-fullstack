import React, { useState } from 'react';
import { 
    Box, Typography, Card, CardContent, Divider, Stack, Paper, IconButton, Grid, Alert
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import type { FinalRoomResultDto, QuestionResultDto } from '../model/socket.types';
import type { QuestionType as RestQuestionType } from '../model/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const OpenTextVisualizer: React.FC<{ answers: string[] }> = ({ answers }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    if (!answers || answers.length === 0) return <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>Brak odpowiedzi tekstowych.</Typography>;
    return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Paper elevation={0} variant="outlined" sx={{ p: 3, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa', borderRadius: 2, mb: 1 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>"{answers[currentIndex]}"</Typography>
            </Paper>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <IconButton onClick={() => setCurrentIndex((prev) => (prev - 1 + answers.length) % answers.length)} disabled={answers.length <= 1}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
                <Typography variant="caption" color="text.secondary">{currentIndex + 1} z {answers.length}</Typography>
                <IconButton onClick={() => setCurrentIndex((prev) => (prev + 1) % answers.length)} disabled={answers.length <= 1}><ArrowForwardIosIcon fontSize="small" /></IconButton>
            </Stack>
        </Box>
    );
};

const QuestionVisualization: React.FC<{ result: QuestionResultDto }> = ({ result }) => {
    const questionType = result.type as RestQuestionType;
    if (questionType === 'OPEN_TEXT') return <OpenTextVisualizer answers={result.openAnswers || []} />;

    const counts = result.answerCounts || {};
    const chartData = Object.entries(counts).map(([option, count]) => ({ name: option, count })).sort((a, b) => b.count - a.count);

    if (chartData.length === 0) return <Typography variant="body2" align="center" sx={{ py: 5 }} color="text.secondary">Brak głosów.</Typography>;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

interface ResultsVisualizerProps {
    results: FinalRoomResultDto;
}

export const RoomResultsVisualizer: React.FC<ResultsVisualizerProps> = ({ results }) => {
    const displayResults = results.results || [];

    if (displayResults.length === 0) {
        return <Alert severity="info">Brak danych do wyświetlenia.</Alert>;
    }

    return (
        <Grid container spacing={3}>
            {displayResults.map((result, index) => (
                <Grid size={{ xs: 12 }} key={result.questionId}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {index + 1}. {result.title}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <QuestionVisualization result={result} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};