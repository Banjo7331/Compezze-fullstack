package com.cmze.external.jpa;

import com.cmze.entity.SurveyEntrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyEntrantJpaRepository extends JpaRepository<SurveyEntrant, Long> {
    boolean existsBySurveyRoom_IdAndUserId(UUID roomId, UUID participantUserId);

    long countBySurveyRoom_Id(UUID roomId);

    Optional<SurveyEntrant> findBySurveyRoom_IdAndUserId(UUID roomId, UUID participantUserId);

    @Query("SELECT se FROM SurveyEntrant se " +
            "LEFT JOIN FETCH se.surveyAttempt sa " + // Dociągamy od razu Attempt (odpowiedź)
            "LEFT JOIN FETCH sa.participantAnswers pa " + // Dociągamy odpowiedzi na pytania
            "WHERE se.surveyRoom.id = :roomId")
    List<SurveyEntrant> findAllBySurveyRoomId(@Param("roomId") UUID roomId);
}
