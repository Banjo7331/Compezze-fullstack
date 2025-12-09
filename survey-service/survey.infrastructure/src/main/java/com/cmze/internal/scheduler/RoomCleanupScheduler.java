package com.cmze.internal.scheduler;

import com.cmze.entity.SurveyRoom;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.usecase.room.CloseSurveyRoomUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class RoomCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RoomCleanupScheduler.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final CloseSurveyRoomUseCase closeSurveyRoomUseCase;

    public RoomCleanupScheduler(SurveyRoomRepository surveyRoomRepository,
                                CloseSurveyRoomUseCase closeSurveyRoomUseCase) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.closeSurveyRoomUseCase = closeSurveyRoomUseCase;
    }

    @Scheduled(fixedRate = 60000)
    public void cleanup() {
        LocalDateTime now = LocalDateTime.now();

        List<SurveyRoom> expiredRooms = surveyRoomRepository.findAllExpiredActiveRooms(now);

        if (!expiredRooms.isEmpty()) {
            logger.info("Found {} expired rooms. Closing...", expiredRooms.size());

            for (SurveyRoom room : expiredRooms) {
                try {
                    closeSurveyRoomUseCase.executeSystemClose(room);
                } catch (Exception e) {
                    logger.error("Failed to auto-close room {}", room.getId(), e);
                }
            }
        }
    }
}
