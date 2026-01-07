import React, { useEffect, useState } from 'react';
import { Spin, Alert, Tag, Typography, Space, Card } from 'antd';

import { contestService } from '@/features/contest/api/contestService';
import { useQuizRoomSocket } from '@/features/quiz/hooks/useQuizRoomSocket';
import { quizService } from '@/features/quiz/api/quizService';
import { QuizRoomStatus } from '@/features/quiz/model/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { QuizLobby } from '@/features/quiz/components/live/QuizLobby';
import { QuizGameView } from '@/features/quiz/components/live/QuizGameView';
import { QuizResultView } from '@/features/quiz/components/live/QuizResultView';

const { Text } = Typography;

interface Props {
    roomId: string;
    contestId: string;
    contestRoomId: string;
    ticket?: string | null;
    isHost: boolean;
    currentUserNickname?: string;
    onGameEnd?: () => void;
}

export const EmbeddedQuizRoom: React.FC<Props> = ({ 
   roomId, contestId, contestRoomId, ticket, isHost, currentUserNickname, onGameEnd
}) => {
    const { 
        status, currentQuestion, leaderboard, finalResults, error 
    } = useQuizRoomSocket(roomId);
    
    const { showError, showSuccess } = useSnackbar();
    const [hasJoined, setHasJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(true);

    useEffect(() => {
        let mounted = true;

        const performJoin = async () => {
            if (hasJoined) {
                setIsJoining(false);
                return;
            }

            try {
                const nick = currentUserNickname || (isHost ? "HOST" : "Participant");
                let tokenToUse = ticket;

                if (!tokenToUse && contestId) {
                    try {
                        console.log(`[EmbeddedQuiz] Fetching token for contestId: ${contestId}...`);
                        tokenToUse = await contestService.getStageAccessToken(contestId, contestRoomId);
                    } catch (e) {
                        console.error("Failed to fetch quiz token", e);
                    }
                }
                
                await quizService.joinRoom(roomId, nick, tokenToUse || undefined);
                if (mounted) setHasJoined(true);
            } catch (e: any) {
                if (e.response?.status === 409) { 
                   console.log("User already in room, connecting socket...");
                   if (mounted) setHasJoined(true);
                } else {
                   console.error("Join error:", e);
                   showError("Problem joining the game.");
                }
            } finally {
                if (mounted) setIsJoining(false);
            }
        };

        if (roomId) performJoin();
        return () => { mounted = false; };
    }, [roomId, contestId, contestRoomId, ticket, isHost, currentUserNickname, hasJoined]);

    const handleStartGame = async () => {
        if (!isHost) return;
        try { await quizService.startQuiz(roomId); } 
        catch (e) { showError("Error starting quiz."); }
    };

    const handleSubmitAnswer = async (optionId: number) => {
        if (!currentQuestion) return;
        try {
            const qId = currentQuestion.questionId || currentQuestion.id;
            await quizService.submitAnswer(roomId, qId, optionId);
        } catch (e) {
            
         }
    };

    const handleNextQuestion = async () => {
        if (!isHost) return;
        await quizService.nextQuestion(roomId);
    };
    
    const handleFinishQuestion = async () => {
        if (!isHost) return;
        await quizService.finishQuestionManually(roomId);
    };

    const handleCloseRoom = async () => {
        if (!isHost) return;
        if(window.confirm("Close quiz room?")) {
            await quizService.closeRoom(roomId);
            if (onGameEnd) onGameEnd();
        }
    };

    const joinUrl = `${window.location.origin}/quiz/join/${roomId}`;
    const handleCopyLink = () => {
        navigator.clipboard.writeText(joinUrl);
        showSuccess("Link copied!");
    };

    if (error) {
        return <div style={{ padding: 24, textAlign: 'center' }}><Alert message={`Game status: ${error}`} type="error" showIcon /></div>;
    }

    if (isJoining && !status) {
        return <div style={{ textAlign: 'center', padding: 64 }}><Spin size="large" /></div>;
    }

    return (
        <Card bodyStyle={{ padding: 0 }} style={{ width: '100%', minHeight: 500, overflow: 'hidden', borderRadius: 12 }}>
            {status === QuizRoomStatus.LOBBY && (
                <div>
                    {isHost && (
                        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center' }}>
                            <Space>
                                <Text type="secondary">Session ID:</Text>
                                <Tag color="blue">{roomId}</Tag>
                            </Space>
                        </div>
                    )}
                    <QuizLobby isHost={isHost} roomId={roomId} participants={leaderboard} onStart={handleStartGame} />
                </div>
            )}

            {status === QuizRoomStatus.QUESTION_ACTIVE && currentQuestion && (
                <QuizGameView 
                    question={currentQuestion as any} isHost={isHost}
                    onSubmitAnswer={handleSubmitAnswer} onFinishEarly={handleFinishQuestion}
                />
            )}

            {status === QuizRoomStatus.QUESTION_FINISHED && (
                <QuizResultView 
                    status={status} isHost={isHost} leaderboard={leaderboard}
                    onNext={handleNextQuestion} onClose={handleCloseRoom}
                />
            )}

            {status === QuizRoomStatus.FINISHED && (
                <QuizResultView 
                    status={status} isHost={isHost} leaderboard={finalResults?.leaderboard || leaderboard}
                    onNext={() => {}} onClose={onGameEnd || (() => {})} 
                />
            )}
        </Card>
    );
};