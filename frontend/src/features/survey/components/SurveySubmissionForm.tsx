import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Stack, Radio, RadioGroup, 
    FormControlLabel, FormControl, FormLabel, Checkbox, 
    TextField, CircularProgress, Alert, Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@/shared/ui/Button';
import { surveyService } from '../api/surveyService';

import type { SurveyFormStructure, SubmitSurveyAttemptRequest, GetQuestionResponse } from '../model/types'; 
import { QuestionTypeValues } from '../model/types';

interface AnswerState {
    questionId: number;
    answers: string[]; 
}

interface SurveySubmissionFormProps {
    surveyForm: SurveyFormStructure;
    roomId: string;
    onSubmissionSuccess: () => void;
    onSubmissionFailure: (error: any) => void;
}

export const SurveySubmissionForm: React.FC<SurveySubmissionFormProps> = ({ 
    surveyForm, 
    roomId, 
    onSubmissionSuccess, 
    onSubmissionFailure 
}) => {
    const [answers, setAnswers] = useState<AnswerState[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (surveyForm && surveyForm.questions) {
            const initialAnswers: AnswerState[] = surveyForm.questions.map(q => ({
                questionId: q.id,
                answers: [],
            }));
            setAnswers(initialAnswers);
        }
    }, [surveyForm]);

    const handleAnswerChange = (questionId: number, newValues: string | string[]) => {
        setAnswers(prev => {
            const index = prev.findIndex(a => a.questionId === questionId);
            const newAnswerList = Array.isArray(newValues) ? newValues : [newValues];
            if (index !== -1) {
                const newAnswers = [...prev];
                newAnswers[index] = { questionId, answers: newAnswerList };
                return newAnswers;
            }
            return prev;
        });
    };

    const isFormValid = answers.every(answer => 
        answer.answers.length > 0 && answer.answers.some(val => val.trim().length > 0)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsSubmitting(true);

        const submissionData: SubmitSurveyAttemptRequest = {
            surveyId: surveyForm.id,
            participantAnswers: answers.map(a => ({
                questionId: a.questionId,
                answers: a.answers.filter(val => val.trim().length > 0),
            })),
        };

        try {
            await surveyService.submitAnswers(roomId, submissionData);
            onSubmissionSuccess();
        } catch (error) {
            onSubmissionFailure(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={4} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>{surveyForm.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>Room ID: {roomId}</Typography>

            <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                    {surveyForm.questions.map((question, index) => (
                        <Box key={question.id}>
                            <FormControl component="fieldset" fullWidth>
                                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    {index + 1}. {question.title}
                                </FormLabel>
                                {renderQuestionInput(question, handleAnswerChange, answers)}
                            </FormControl>
                            <Divider sx={{ mt: 3 }} />
                        </Box>
                    ))}
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};

const renderQuestionInput = (
    question: GetQuestionResponse, 
    handleChange: (id: number, values: string | string[]) => void,
    currentAnswers: AnswerState[]
) => {
    const currentAnswer = currentAnswers.find(a => a.questionId === question.id)?.answers[0] || '';
    const currentAnswerList = currentAnswers.find(a => a.questionId === question.id)?.answers || [];

    const handleSingleChoice = (event: React.ChangeEvent<HTMLInputElement>) => handleChange(question.id, event.target.value);
    
    const handleMultiChoice = (value: string) => {
        const list = currentAnswerList.includes(value)
            ? currentAnswerList.filter(v => v !== value)
            : [...currentAnswerList, value];
        handleChange(question.id, list);
    };

    switch (question.type) {
        case QuestionTypeValues.SINGLE_CHOICE:
            return (
                <RadioGroup name={`q-${question.id}`} value={currentAnswer} onChange={handleSingleChoice}>
                    {question.possibleChoices.map((choice, i) => (
                        <FormControlLabel key={i} value={choice} control={<Radio />} label={choice} />
                    ))}
                </RadioGroup>
            );
        case QuestionTypeValues.MULTIPLE_CHOICE:
            return (
                <Stack>
                    {question.possibleChoices.map((choice, i) => (
                        <FormControlLabel key={i} label={choice} control={
                            <Checkbox checked={currentAnswerList.includes(choice)} onChange={() => handleMultiChoice(choice)} />
                        }/>
                    ))}
                </Stack>
            );
        case QuestionTypeValues.OPEN_TEXT:
            return (
                <TextField fullWidth multiline rows={3} variant="outlined" value={currentAnswer}
                    onChange={(e) => handleChange(question.id, e.target.value)} placeholder="Wpisz swoją odpowiedź..." />
            );
        default: return <Alert severity="warning">Unsupported question type.</Alert>;
    }
};