package com.cmze.internal.scheduler;

import com.cmze.enums.QuizRoomStatus;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.usecase.room.FinishCurrentQuestionUseCase;
import com.cmze.usecase.room.NextQuestionUseCase;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class QuizGameLoopScheduler {

    private final QuizRoomRepository quizRoomRepository;
    private final FinishCurrentQuestionUseCase finishCurrentQuestionUseCase;
    private final NextQuestionUseCase nextQuestionUseCase;

    public QuizGameLoopScheduler(final QuizRoomRepository quizRoomRepository,
                                 final FinishCurrentQuestionUseCase finishCurrentQuestionUseCase,
                                 final NextQuestionUseCase nextQuestionUseCase) {
        this.quizRoomRepository = quizRoomRepository;
        this.finishCurrentQuestionUseCase = finishCurrentQuestionUseCase;
        this.nextQuestionUseCase = nextQuestionUseCase;
    }

    @Scheduled(fixedRate = 1000)
    public void checkQuestionTimers() {
        final var now = LocalDateTime.now();

        final var expiredRooms = quizRoomRepository.findRoomsWithExpiredTimer(now);

        for (final var room : expiredRooms) {

            if (room.getStatus() == QuizRoomStatus.QUESTION_ACTIVE) {
                finishCurrentQuestionUseCase.executeSystem(room);
            }

            else if (room.getStatus() == QuizRoomStatus.QUESTION_FINISHED) {
                nextQuestionUseCase.executeSystem(room);
            }
        }
    }
}
