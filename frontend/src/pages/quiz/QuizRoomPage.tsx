import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Box, Alert, TextField, Paper, Typography, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@/shared/ui/Button';

import { useQuizRoomSocket } from '@/features/quiz/hooks/useQuizRoomSocket';
import { quizService } from '@/features/quiz/api/quizService';
import { QuizRoomStatus } from '@/features/quiz/model/types';
import { useAuth } from '@/features/auth/AuthContext';

import { QuizLobby } from '@/features/quiz/components/QuizLobby';
import { QuizGameView } from '@/features/quiz/components/QuizGameView';
import { QuizResultView } from '@/features/quiz/components/QuizResultView';
import { InviteUsersPanel } from '@/features/quiz/components/InviteUserPanel';

const QuizRoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth(); 
    
    const [isJoined, setIsJoined] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [nickname, setNickname] = useState('');
    
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [isLoadingCheck, setIsLoadingCheck] = useState(true);

    const { status, currentQuestion, participantsCount, leaderboard, finalResults } = useQuizRoomSocket(roomId || '');

    useEffect(() => {
        if (!roomId) return;

        const initRoom = async () => {
            try {
                const details = await quizService.getRoomDetails(roomId);
                
                if (currentUser && details.hostId === currentUser.id) {
                    console.log("Wykryto Hosta. Automatyczne dołączanie...");
                    await quizService.joinRoom(roomId, "HOST"); 
                    setIsHost(true);
                    setIsJoined(true);
                }
                else if (details.participant){
                    console.log("Wykryto powracającego Gracza.");
                    setIsJoined(true);
                }
            } catch (e) {
                console.error("Błąd inicjalizacji pokoju", e);
                setJoinError("Nie udało się załadować pokoju.");
            } finally {
                setIsLoadingCheck(false);
            }
        };

        initRoom();
    }, [roomId, currentUser]);

    const handleJoin = async () => {
        if (!nickname) return;
        const ticket = searchParams.get('ticket'); 

        setIsJoining(true);
        setJoinError(null);
        try {
            const res = await quizService.joinRoom(roomId!, nickname, ticket);
            setIsHost(res.host); 
            setIsJoined(true);
        } catch (e: any) {
            console.error(e);
            setJoinError("Nie udało się dołączyć. Sprawdź ksywkę lub czy masz zaproszenie.");
        } finally {
            setIsJoining(false);
        }
    };

    const handleStartGame = async () => {
        if (!roomId) return;
        if (window.confirm("Czy na pewno rozpocząć Quiz?")) {
            await quizService.startQuiz(roomId);
        }
    };

    const handleCloseRoom = async () => {
        if (!roomId) return;
        if(window.confirm("Czy na pewno zakończyć sesję?")) {
            await quizService.closeRoom(roomId);
        }
    };

    const handleFinishQuestionManually = async () => {
        if (!roomId) return;
        await quizService.finishQuestionManually(roomId);
    };
    
    const handleNextQuestion = async () => {
        if (!roomId) return;
        await quizService.nextQuestion(roomId);
    };

    const handleSubmitAnswer = async (optionId: number) => {
        if (!roomId || !currentQuestion) return;
        await quizService.submitAnswer(roomId, currentQuestion.questionId, optionId);
    };

    if (!roomId) return <Alert severity="error">Brak ID pokoju</Alert>;
    if (isLoadingCheck) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    if (!isJoined) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Witaj w Quizie!</Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Podaj nazwę, pod którą będziesz widoczny w rankingu.
                    </Typography>
                    
                    <TextField 
                        label="Twoja Ksywka" 
                        fullWidth 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        error={!!joinError}
                        helperText={joinError}
                        disabled={isJoining}
                        autoFocus
                    />
                    <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3 }} 
                        onClick={handleJoin}
                        disabled={!nickname || isJoining}
                    >
                        {isJoining ? <CircularProgress size={24} color="inherit"/> : "DOŁĄCZ DO GRY"}
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {isHost && status !== QuizRoomStatus.FINISHED && (
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 2, mb: 4, 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        bgcolor: '#fff3e0', borderLeft: '5px solid #ed6c02'
                    }}
                >
                    <Typography fontWeight="bold" variant="subtitle1">👑 Panel Hosta</Typography>
                    <Box>
                        <Button color="error" size="small" onClick={handleCloseRoom} startIcon={<CloseIcon />}>
                            Zakończ Sesję
                        </Button>
                    </Box>
                </Paper>
            )}

            {status === QuizRoomStatus.LOBBY && (
                <>
                    <QuizLobby 
                        isHost={isHost} 
                        roomId={roomId}
                        participants={leaderboard || []} 
                        onStart={handleStartGame} 
                    />
                    {isHost && <Box mt={4}><InviteUsersPanel roomId={roomId} /></Box>}
                </>
            )}

            {status === QuizRoomStatus.QUESTION_ACTIVE && currentQuestion && (
                <QuizGameView 
                    question={currentQuestion as any} 
                    isHost={isHost}
                    onSubmitAnswer={handleSubmitAnswer}
                    onFinishEarly={handleFinishQuestionManually}
                />
            )}

            {(status === QuizRoomStatus.QUESTION_FINISHED) && (
                <QuizResultView 
                    status={status}
                    isHost={isHost}
                    leaderboard={leaderboard || []}
                    onNext={handleNextQuestion}
                    onClose={handleCloseRoom}
                />
            )}

            {status === QuizRoomStatus.FINISHED && (
                <QuizResultView 
                    status={status}
                    isHost={isHost}
                    leaderboard={finalResults?.leaderboard || leaderboard || []}
                    onNext={() => {}}
                    onClose={() => navigate('/quiz')}
                />
            )}

        </Container>
    );
};

export default QuizRoomPage;