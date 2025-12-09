package com.cmze.repository;

import com.cmze.entity.SurveyEntrant;
import com.cmze.external.jpa.SurveyEntrantJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class SurveyEntrantRepositoryImpl implements SurveyEntrantRepository{

    private final SurveyEntrantJpaRepository impl;

    @Autowired
    public SurveyEntrantRepositoryImpl(SurveyEntrantJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Optional<SurveyEntrant> findById(Long Id) {
        return impl.findById(Id);
    }

    @Override
    public Optional<SurveyEntrant> findBySurveyRoom_IdAndParticipantUserId(UUID roomId, UUID entrantId) {
        return impl.findBySurveyRoom_IdAndUserId(roomId, entrantId);
    }

    @Override
    public SurveyEntrant save(SurveyEntrant entrant) {
        return impl.save(entrant);
    }

    @Override
    public boolean existsBySurveyRoom_IdAndParticipantUserId(UUID roomId, UUID participantUserId) {
        return impl.existsBySurveyRoom_IdAndUserId(roomId, participantUserId);
    }

    @Override
    public Long countBySurveyRoom_Id(UUID roomId) {
        return impl.countBySurveyRoom_Id(roomId);
    }

    @Override
    public List<SurveyEntrant> findAllBySurveyRoomId(UUID roomId) {
        return impl.findAllBySurveyRoomId(roomId);
    }
}
