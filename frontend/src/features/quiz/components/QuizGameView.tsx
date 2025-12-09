import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, Alert } from '@mui/material';
import { Button } from '@/shared/ui/Button';

interface OptionDto {
    id: number;
    text: string;
}

interface GameQuestion {
    questionIndex: number;
    title: string;
    options: OptionDto[]; 
    timeLimitSeconds: number;
    endTime: number;
}

interface QuizGameViewProps {
    question: GameQuestion;
    isHost: boolean;
    onSubmitAnswer: (optionId: number) => void;
    onFinishEarly?: () => void;
}

export const QuizGameView: React.FC<QuizGameViewProps> = ({ question, isHost, onSubmitAnswer, onFinishEarly }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((question.endTime - now) / 1000));
            setTimeLeft(diff);
        }, 200);
        return () => clearInterval(interval);
    }, [question]);

    const handleAnswer = (optId: number) => {
        if (isHost) return;
        setSelectedOptionId(optId);
        onSubmitAnswer(optId);
    };

    const progress = Math.min(100, Math.max(0, (timeLeft / question.timeLimitSeconds) * 100));

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="overline" align="center" display="block">
                    Pytanie {question.questionIndex + 1}
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    color={timeLeft < 5 ? "error" : "primary"} 
                    sx={{ height: 15, borderRadius: 6 }} 
                />
                <Typography align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem', mt: 1 }}>
                    {timeLeft}s
                </Typography>
            </Box>

            <Paper elevation={4} sx={{ p: 5, mb: 5, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    {question.title}
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {question.options.map((opt) => (
                    <Grid size={{ xs: 12, md: 6 }} key={opt.id}>
                        <Button 
                            fullWidth 
                            variant={selectedOptionId === opt.id ? "contained" : "outlined"} 
                            size="large"
                            onClick={() => handleAnswer(opt.id)}
                            disabled={selectedOptionId !== null || isHost || timeLeft === 0}
                            sx={{ 
                                height: 100, 
                                fontSize: '1.2rem',
                                borderColor: selectedOptionId === opt.id ? 'primary.main' : '#ddd',
                                bgcolor: selectedOptionId === opt.id ? 'primary.main' : 'background.paper',
                                color: selectedOptionId === opt.id ? 'white' : 'text.primary',
                                '&:hover': { bgcolor: selectedOptionId === opt.id ? 'primary.dark' : '#f0f0f0' }
                            }}
                        >
                            {opt.text}
                        </Button>
                    </Grid>
                ))}
            </Grid>

            {isHost && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Widok Hosta. Nie możesz odpowiadać.
                    </Alert>
                    <Button 
                        variant="outlined" 
                        color="warning" 
                        size="large"
                        onClick={onFinishEarly}
                    >
                        Zakończ Pytanie Teraz ⏹️
                    </Button>
                </Box>
            )}
        </Box>
    );
};