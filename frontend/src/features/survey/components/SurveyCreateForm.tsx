import React, { useState } from 'react';
import { 
    Typography, TextField, Box, Stack, Card, CardContent, 
    IconButton, MenuItem, Select, FormControl, InputLabel, 
    FormControlLabel, Switch, Grid, Paper, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button } from '@/shared/ui/Button'; 

import type { QuestionType, CreateSurveyFormRequest, SurveyFormResponse } from '../model/types';
import { QuestionTypeValues } from '../model/types';
import { surveyService } from '../api/surveyService'; 

interface QuestionDraft {
    id: number;
    title: string;
    type: QuestionType;
    possibleChoices: string[]; 
}

interface SurveyCreateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export const SurveyCreateForm: React.FC<SurveyCreateFormProps> = ({ onCancel, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [questions, setQuestions] = useState<QuestionDraft[]>([
        { id: Date.now(), title: '', type: QuestionTypeValues.SINGLE_CHOICE, possibleChoices: [''] }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const TITLE_MIN = 8;
    const TITLE_MAX = 20;
    const QUESTIONS_MAX = 20;
    const CHOICES_MAX = 8;
    
    const isTitleValid = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
    const hasEnoughQuestions = questions.length > 0;

    const areQuestionsValid = questions.every(q => {
        if (q.title.trim().length === 0) return false;
        if (q.type !== QuestionTypeValues.OPEN_TEXT) {
            return q.possibleChoices.length > 0 && q.possibleChoices.every(c => c.trim().length > 0);
        }
        return true; 
    });

    const isFormValid = isTitleValid && hasEnoughQuestions && areQuestionsValid && !isSubmitting;

    const addQuestion = () => {
        if (questions.length >= QUESTIONS_MAX) return; 
        setQuestions([
            ...questions, 
            { id: Date.now(), title: '', type: QuestionTypeValues.SINGLE_CHOICE, possibleChoices: [''] }
        ]);
    };

    const removeQuestion = (id: number) => {
        if (questions.length <= 1) return; 
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: number, field: keyof QuestionDraft, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                if (field === 'type' && value === QuestionTypeValues.OPEN_TEXT) {
                    return { ...q, [field]: value, possibleChoices: [] };
                }
                if (field === 'type' && value !== QuestionTypeValues.OPEN_TEXT && q.type === QuestionTypeValues.OPEN_TEXT) {
                     return { ...q, [field]: value, possibleChoices: [''] };
                }
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const addOption = (questionId: number) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.possibleChoices.length < CHOICES_MAX) { 
                return { ...q, possibleChoices: [...q.possibleChoices, ''] };
            }
            return q;
        }));
    };

    const updateOption = (questionId: number, index: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newChoices = [...q.possibleChoices];
                newChoices[index] = value;
                return { ...q, possibleChoices: newChoices };
            }
            return q;
        }));
    };

    const removeOption = (questionId: number, index: number) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newChoices = q.possibleChoices.filter((_, i) => i !== index);
                return { ...q, possibleChoices: newChoices.length > 0 ? newChoices : [''] }; 
            }
            return q;
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            alert("Validation Error: Check title length and question content.");
            return;
        }
        
        setIsSubmitting(true);
        
        const payload: CreateSurveyFormRequest = {
            title: title,
            isPrivate: isPrivate,
            questions: questions.map(q => ({
                title: q.title,
                type: q.type,
                possibleChoices: q.type === QuestionTypeValues.OPEN_TEXT ? [] : q.possibleChoices.filter(c => c.trim().length > 0)
            }))
        };

        try {
            await surveyService.createSurveyForm(payload); 
            
            onSuccess(); 

        } catch (error) {
            console.error("Error creating survey:", error);
            alert("An error occurred while creating the survey.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card component={Paper} elevation={6} sx={{ p: 4 }}>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        
                        <Box>
                            <Typography variant="h6" gutterBottom>Basic Info</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label={`Title (${TITLE_MIN}-${TITLE_MAX} chars)`}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    error={title.length > 0 && !isTitleValid}
                                    helperText={title.length > 0 && !isTitleValid ? "Invalid title length" : ""}
                                />
                                <FormControlLabel
                                    control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />}
                                    label={isPrivate ? "Private" : "Public"}
                                />
                            </Stack>
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5">Questions ({questions.length}/{QUESTIONS_MAX})</Typography>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={addQuestion}
                                    disabled={questions.length >= QUESTIONS_MAX}
                                >
                                    Add
                                </Button>
                            </Box>

                            <Stack spacing={3}>
                                {questions.map((q, qIndex) => (
                                    <Card key={q.id} variant="outlined" sx={{ position: 'relative', borderLeft: '4px solid #1976d2' }}>
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 8 }}>
                                                    <TextField
                                                        fullWidth
                                                        label={`Question #${qIndex + 1}`}
                                                        value={q.title}
                                                        onChange={(e) => updateQuestion(q.id, 'title', e.target.value)}
                                                        required
                                                        error={q.title.trim().length === 0}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Type</InputLabel>
                                                        <Select
                                                            value={q.type}
                                                            label="Type"
                                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)}
                                                        >
                                                            <MenuItem value={QuestionTypeValues.SINGLE_CHOICE}>Single Choice</MenuItem>
                                                            <MenuItem value={QuestionTypeValues.MULTIPLE_CHOICE}>Multiple Choice</MenuItem>
                                                            <MenuItem value={QuestionTypeValues.OPEN_TEXT}>Text</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            {q.type !== QuestionTypeValues.OPEN_TEXT && (
                                                <Box sx={{ mt: 2, ml: 2 }}>
                                                    <Stack spacing={1}>
                                                        {q.possibleChoices.map((choice, cIndex) => (
                                                            <Box key={cIndex} sx={{ display: 'flex', gap: 1 }}>
                                                                <TextField 
                                                                    size="small" fullWidth
                                                                    placeholder={`Option ${cIndex + 1}`}
                                                                    value={choice}
                                                                    onChange={(e) => updateOption(q.id, cIndex, e.target.value)}
                                                                />
                                                                <IconButton 
                                                                    size="small" onClick={() => removeOption(q.id, cIndex)}
                                                                    disabled={q.possibleChoices.length <= 1}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                        ))}
                                                        {q.possibleChoices.length < CHOICES_MAX && (
                                                            <Button size="small" onClick={() => addOption(q.id)}>+ Option</Button>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            )}
                                        </CardContent>
                                        {questions.length > 1 && (
                                            <IconButton 
                                                onClick={() => removeQuestion(q.id)}
                                                sx={{ position: 'absolute', top: 5, right: 5 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Card>
                                ))}
                            </Stack>
                            {!hasEnoughQuestions && <Typography color="error">Add at least one question.</Typography>}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                            <Button variant="outlined" onClick={onCancel} startIcon={<ArrowBackIcon />}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={!isFormValid || isSubmitting} 
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Survey'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
};