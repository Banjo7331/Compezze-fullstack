package com.cmze.internal.scheduler;

import com.cmze.entity.QuizRoom;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.usecase.room.CloseQuizRoomUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RoomCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RoomCleanupScheduler.class);

    private final QuizRoomRepository quizRoomRepository;
    private final CloseQuizRoomUseCase closeQuizRoomUseCase;

    public RoomCleanupScheduler(final QuizRoomRepository quizRoomRepository,
                                    final CloseQuizRoomUseCase closeQuizRoomUseCase) {
        this.quizRoomRepository = quizRoomRepository;
        this.closeQuizRoomUseCase = closeQuizRoomUseCase;
    }

    @Scheduled(fixedRate = 60000)
    public void cleanup() {
        final var now = LocalDateTime.now();

        final var expiredRooms = quizRoomRepository.findAllExpiredActiveRooms(now);

        if (!expiredRooms.isEmpty()) {
            logger.info("Found {} expired quiz rooms. Force closing...", expiredRooms.size());

            for (final QuizRoom room : expiredRooms) {
                try {
                    closeQuizRoomUseCase.executeSystemForceClose(room);
                } catch (Exception e) {
                    logger.error("Failed to auto-close quiz room {}", room.getId(), e);
                }
            }
        }
    }
}
