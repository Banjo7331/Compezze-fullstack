import React, { useState } from 'react';
import { 
    Typography, TextField, Box, Stack, Card, CardContent, 
    IconButton, MenuItem, Select, FormControl, InputLabel, 
    FormControlLabel, Switch, Grid, Paper, CircularProgress, 
    Radio, Checkbox, Divider, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';

import { Button } from '@/shared/ui/Button'; 
import { quizService } from '../api/quizService'; 
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { QuestionType } from '../model/types';
import type { CreateQuizFormRequest } from '../model/types';

interface OptionDraft {
    text: string;
    isCorrect: boolean;
}

interface QuestionDraft {
    id: number;
    title: string;
    type: typeof QuestionType[keyof typeof QuestionType];
    points: number;
    options: OptionDraft[];
}

interface QuizCreateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

const DEFAULT_OPTIONS_SINGLE: OptionDraft[] = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
];

const DEFAULT_OPTIONS_TF: OptionDraft[] = [
    { text: 'Prawda', isCorrect: true },
    { text: 'Fałsz', isCorrect: false }
];

export const QuizCreateForm: React.FC<QuizCreateFormProps> = ({ onCancel, onSuccess }) => {
    const { showSuccess, showError } = useSnackbar();

    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [questions, setQuestions] = useState<QuestionDraft[]>([
        { 
            id: Date.now(), 
            title: '', 
            type: QuestionType.SINGLE_CHOICE, 
            points: 1000,
            options: JSON.parse(JSON.stringify(DEFAULT_OPTIONS_SINGLE))
        }
    ]);

    const addQuestion = () => {
        if (questions.length >= 50) return;
        setQuestions([
            ...questions,
            { 
                id: Date.now(), 
                title: '', 
                type: QuestionType.SINGLE_CHOICE, 
                points: 1000,
                options: JSON.parse(JSON.stringify(DEFAULT_OPTIONS_SINGLE))
            }
        ]);
    };

    const removeQuestion = (id: number) => {
        if (questions.length <= 1) return;
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: number, field: keyof QuestionDraft, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                if (field === 'type') {
                    const newType = value;
                    if (newType === QuestionType.TRUE_FALSE) {
                        return { ...q, type: newType, options: JSON.parse(JSON.stringify(DEFAULT_OPTIONS_TF)) };
                    }
                    if (q.type === QuestionType.TRUE_FALSE && newType !== QuestionType.TRUE_FALSE) {
                        return { ...q, type: newType, options: JSON.parse(JSON.stringify(DEFAULT_OPTIONS_SINGLE)) };
                    }
                    if (newType === QuestionType.SINGLE_CHOICE) {
                         const firstCorrect = q.options.findIndex(o => o.isCorrect);
                         const safeIndex = firstCorrect !== -1 ? firstCorrect : 0;
                         const newOptions = q.options.map((o, i) => ({ ...o, isCorrect: i === safeIndex }));
                         return { ...q, type: newType, options: newOptions };
                    }
                }
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const handleOptionTextChange = (qId: number, oIndex: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[oIndex] = { ...newOptions[oIndex], text };
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleCorrectChange = (qId: number, oIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
                    newOptions.forEach((o, i) => o.isCorrect = (i === oIndex));
                } else {
                    newOptions[oIndex].isCorrect = !newOptions[oIndex].isCorrect;
                }
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const addOption = (qId: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options.length < CHOICES_MAX) {
                return { ...q, options: [...q.options, { text: '', isCorrect: false }] };
            }
            return q;
        }));
    };

    const removeOption = (qId: number, oIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = q.options.filter((_, i) => i !== oIndex);
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const TITLE_MIN = 3;
    const TITLE_MAX = 50;
    const QUESTIONS_MAX = 20;
    const CHOICES_MAX = 6;

    const isTitleValid = title.length >= TITLE_MIN && title.length <= TITLE_MAX;
    const hasEnoughQuestions = questions.length > 0;

    const areQuestionsValid = questions.every(q => {
        const titleOk = q.title.trim().length > 0;
        const optionsOk = q.options.every(o => o.text.trim().length > 0);
        const correctOk = q.options.some(o => o.isCorrect);
        return titleOk && optionsOk && correctOk;
    });

    const isFormValid = isTitleValid && hasEnoughQuestions && areQuestionsValid && !isSubmitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);

        const payload: CreateQuizFormRequest = {
            title,
            isPrivate,
            questions: questions.map(q => ({
                title: q.title,
                type: q.type,
                points: q.points,
                options: q.options
            }))
        };

        try {
            await quizService.createForm(payload);
            showSuccess("Quiz utworzony pomyślnie!");
            onSuccess();
        } catch (error) {
            console.error("Error creating quiz:", error);
            showError("Wystąpił błąd podczas tworzenia quizu.");
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
                            <Typography variant="h6" gutterBottom>Ustawienia Główne</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label={`Tytuł Quizu (${TITLE_MIN}-${TITLE_MAX} znaków)`}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    error={title.length > 0 && !isTitleValid}
                                    helperText={title.length > 0 && !isTitleValid ? "Nieprawidłowa długość tytułu" : ""}
                                />
                                <FormControlLabel
                                    control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />}
                                    label="Quiz Prywatny (tylko na zaproszenie)"
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                <Typography variant="h5">Pytania ({questions.length}/{QUESTIONS_MAX})</Typography>
                                <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addQuestion} disabled={questions.length >= QUESTIONS_MAX}>
                                    Dodaj Pytanie
                                </Button>
                            </Box>

                            <Stack spacing={3}>
                                {questions.map((q, qIndex) => (
                                    <Card key={q.id} variant="outlined" sx={{ position: 'relative', borderLeft: '4px solid #ed6c02' }}>
                                        <CardContent>
                                            
                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid size={{ xs: 12, md: 8 }}>
                                                    <TextField
                                                        fullWidth
                                                        label={`Pytanie #${qIndex + 1}`}
                                                        value={q.title}
                                                        onChange={(e) => updateQuestion(q.id, 'title', e.target.value)}
                                                        required
                                                        error={q.title.trim().length === 0}
                                                        placeholder="Wpisz treść pytania..."
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Typ</InputLabel>
                                                        <Select
                                                            value={q.type}
                                                            label="Typ"
                                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                        >
                                                            <MenuItem value={QuestionType.SINGLE_CHOICE}>Jednokrotny wybór</MenuItem>
                                                            <MenuItem value={QuestionType.MULTIPLE_CHOICE}>Wielokrotny wybór</MenuItem>
                                                            <MenuItem value={QuestionType.TRUE_FALSE}>Prawda / Fałsz</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Box sx={{ mb: 2 }}>
                                                <TextField 
                                                    label="Punkty za odpowiedź"
                                                    type="number"
                                                    size="small"
                                                    value={q.points}
                                                    onChange={(e) => updateQuestion(q.id, 'points', Number(e.target.value))}
                                                    InputProps={{ 
                                                        startAdornment: <InputAdornment position="start"><StarIcon fontSize="small"/></InputAdornment> 
                                                    }}
                                                    sx={{ width: 180 }}
                                                    helperText="Max pkt (im szybciej, tym więcej)"
                                                />
                                            </Box>

                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                Odpowiedzi (Zaznacz poprawne):
                                            </Typography>

                                            <Stack spacing={1}>
                                                {q.options.map((opt, oIndex) => (
                                                    <Stack key={oIndex} direction="row" spacing={1} alignItems="center">
                                                        {q.type === QuestionType.MULTIPLE_CHOICE ? (
                                                            <Checkbox checked={opt.isCorrect} onChange={() => handleCorrectChange(q.id, oIndex)} color="success" />
                                                        ) : (
                                                            <Radio checked={opt.isCorrect} onChange={() => handleCorrectChange(q.id, oIndex)} color="success" />
                                                        )}
                                                        
                                                        <TextField 
                                                            fullWidth size="small"
                                                            value={opt.text}
                                                            onChange={(e) => handleOptionTextChange(q.id, oIndex, e.target.value)}
                                                            placeholder={`Opcja ${oIndex + 1}`}
                                                            disabled={q.type === QuestionType.TRUE_FALSE}
                                                        />
                                                        
                                                        {q.type !== QuestionType.TRUE_FALSE && (
                                                            <IconButton size="small" color="error" onClick={() => removeOption(q.id, oIndex)} disabled={q.options.length <= 2}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                ))}
                                            </Stack>

                                            {q.type !== QuestionType.TRUE_FALSE && q.options.length < CHOICES_MAX && (
                                                <Button size="small" sx={{ mt: 1, ml: 4 }} startIcon={<AddCircleOutlineIcon />} onClick={() => addOption(q.id)}>
                                                    Dodaj Opcję
                                                </Button>
                                            )}
                                        </CardContent>

                                        {questions.length > 1 && (
                                            <IconButton onClick={() => removeQuestion(q.id)} sx={{ position: 'absolute', top: 5, right: 5 }} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Card>
                                ))}
                            </Stack>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                            <Button variant="outlined" onClick={onCancel} startIcon={<ArrowBackIcon />}>
                                Anuluj
                            </Button>
                            <Button type="submit" variant="contained" disabled={!isFormValid} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
                                {isSubmitting ? 'Zapisywanie...' : 'Zapisz Quiz'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
};