package com.cmze.repository;

import com.cmze.entity.SurveyRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyRoomRepository {
    SurveyRoom save(SurveyRoom surveyRoom);
    Optional<SurveyRoom> findById(UUID roomId);
    Optional<SurveyRoom> findByIdWithSurveyAndQuestions(UUID roomId);
    Page<SurveyRoom> findAllByIsOpenTrue(Pageable pageable);
    List<SurveyRoom> findAllExpiredActiveRooms(LocalDateTime now);
    boolean existsBySurvey_IdAndIsOpenTrue(Long surveyId);
    Page<SurveyRoom> findByUserId(UUID userId, Pageable pageable);
}
