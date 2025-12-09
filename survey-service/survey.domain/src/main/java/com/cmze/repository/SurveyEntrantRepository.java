package com.cmze.repository;

import com.cmze.entity.SurveyEntrant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyEntrantRepository {
    Optional<SurveyEntrant> findById(Long Id);
    Optional<SurveyEntrant> findBySurveyRoom_IdAndParticipantUserId(UUID roomId, UUID entrantId);
    SurveyEntrant save(SurveyEntrant entrant);
    boolean existsBySurveyRoom_IdAndParticipantUserId(UUID roomId, UUID participantUserId);
    Long countBySurveyRoom_Id(UUID roomId);
    List<SurveyEntrant> findAllBySurveyRoomId(UUID roomId);
}
