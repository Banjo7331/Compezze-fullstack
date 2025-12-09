import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Divider, 
    Alert, 
    Card, 
    CardContent,
    Stack,
    IconButton,
    CircularProgress
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell 
} from 'recharts';
import { useSurveyRoomSocket } from '../hooks/useSurveyRoomSocket'; 
import type { QuestionResultDto } from '../model/socket.types'; 
import type { QuestionType as RestQuestionType } from '../model/types'; 

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const OpenTextVisualizer: React.FC<{ answers: string[] }> = ({ answers }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!answers || answers.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No text answers submitted yet.
            </Typography>
        );
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % answers.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + answers.length) % answers.length);
    };

    return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                    p: 3, 
                    minHeight: 120, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    mb: 2
                }}
            >
                <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: '1.1rem' }}>
                    "{answers[currentIndex]}"
                </Typography>
            </Paper>

            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <IconButton onClick={handlePrev} disabled={answers.length <= 1} color="primary">
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: 'center' }}>
                    {currentIndex + 1} of {answers.length}
                </Typography>
                
                <IconButton onClick={handleNext} disabled={answers.length <= 1} color="primary">
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Box>
    );
};

interface ChartData {
    name: string;
    count: number;
}

interface QuestionVizProps {
    result: QuestionResultDto;
}

const QuestionVisualization: React.FC<QuestionVizProps> = ({ result }) => {
    const questionType = result.type as RestQuestionType; 

    if (questionType === 'OPEN_TEXT') {
        return <OpenTextVisualizer answers={result.openAnswers || []} />;
    }

    const counts = result.answerCounts || {};

    const chartData: ChartData[] = Object.entries(counts).map(([option, count]) => ({
        name: option,
        count: count,
    }));

    chartData.sort((a, b) => b.count - a.count);

    if (chartData.length === 0) {
        return <Typography variant="body2" align="center" sx={{ py: 5 }} color="text.secondary">No votes yet.</Typography>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

interface LiveResultSurveyDashboardProps {
    roomId: string;
    isHost: boolean; 
    isParticipantSubmitted?: boolean; 
}

export const LiveResultSurveyDashboard: React.FC<LiveResultSurveyDashboardProps> = ({ 
    roomId, 
    isHost,
    isParticipantSubmitted = false
}) => {
    const { liveResults, participantCount, isRoomOpen } = useSurveyRoomSocket(roomId);
    
    if (!liveResults) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress size={30} sx={{ mb: 2 }} />
                <Typography color="text.secondary">Connecting to live results stream...</Typography>
            </Box>
        );
    }

    const isAccessDenied = !isHost && !isParticipantSubmitted && isRoomOpen && liveResults.totalSubmissions === 0;

    if (isAccessDenied) {
        return (
            <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                The survey is live! Please submit your answers to view the results.
            </Alert>
        );
    }
    
    const displayResults = liveResults.results || [];

    return (
        <Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary" letterSpacing={1}>
                    Live Statistics
                </Typography>
                <Stack 
                    direction="row" 
                    spacing={4} 
                    justifyContent="center" 
                    divider={<Divider orientation="vertical" flexItem />}
                    sx={{ mt: 1 }}
                >
                    <Box>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {participantCount}
                        </Typography>
                        <Typography variant="caption">Participants</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h4" color="secondary.main" fontWeight="bold">
                            {liveResults.totalSubmissions}
                        </Typography>
                        <Typography variant="caption">Submissions</Typography>
                    </Box>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {displayResults.map((result, index) => (
                    <Grid key={result.questionId} size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ minHeight: 40 }}>
                                    {index + 1}. {result.title}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                <QuestionVisualization result={result} />
                                
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            {displayResults.length === 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>No questions or results available.</Alert>
            )}
        </Box>
    );
};