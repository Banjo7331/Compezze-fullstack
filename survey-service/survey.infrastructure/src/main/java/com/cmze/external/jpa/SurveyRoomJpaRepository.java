package com.cmze.external.jpa;

import com.cmze.entity.SurveyForm;
import com.cmze.entity.SurveyRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyRoomJpaRepository extends JpaRepository<SurveyRoom, UUID>, JpaSpecificationExecutor<SurveyRoom> {
    @Query("SELECT sr FROM SurveyRoom sr " +
            "LEFT JOIN FETCH sr.survey s " +
            "LEFT JOIN FETCH s.questions q " +
            "LEFT JOIN FETCH q.possibleChoices " +
            "WHERE sr.id = :roomId")
    Optional<SurveyRoom> findByIdWithSurveyAndQuestions(@Param("roomId") UUID roomId);

    @Query("SELECT r FROM SurveyRoom r WHERE r.isOpen = true")
    Page<SurveyRoom> findAllByIsOpenTrue(Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
            "FROM SurveyRoom r " +
            "WHERE r.survey.id = :surveyId AND r.isOpen = true")
    boolean existsBySurvey_IdAndIsOpenTrue(@Param("surveyId") Long surveyId);

    @Query("SELECT r FROM SurveyRoom r WHERE r.isOpen = true AND r.validUntil < :now")
    List<SurveyRoom> findAllExpiredActiveRooms(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM SurveyRoom r LEFT JOIN FETCH r.survey WHERE r.userId = :userId")
    Page<SurveyRoom> findByUserId(@Param("userId") UUID userId, Pageable pageable);

}
