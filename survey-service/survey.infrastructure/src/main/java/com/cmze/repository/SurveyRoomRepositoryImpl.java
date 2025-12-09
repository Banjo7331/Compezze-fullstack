package com.cmze.repository;

import com.cmze.entity.SurveyRoom;
import com.cmze.external.jpa.SurveyRoomJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class SurveyRoomRepositoryImpl implements SurveyRoomRepository{

    private final SurveyRoomJpaRepository impl;

    @Autowired
    public SurveyRoomRepositoryImpl(SurveyRoomJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public SurveyRoom save(SurveyRoom surveyRoom) {
        return impl.save(surveyRoom);
    }

    @Override
    public Optional<SurveyRoom> findById(UUID roomId) {
        return impl.findById(roomId);
    }

    @Override
    public Optional<SurveyRoom> findByIdWithSurveyAndQuestions(UUID roomId) {
        return impl.findByIdWithSurveyAndQuestions(roomId);
    }

    @Override
    public Page<SurveyRoom> findAllByIsOpenTrue(Pageable pageable) {
        return impl.findAllByIsOpenTrue(pageable);
    }

    @Override
    public List<SurveyRoom> findAllExpiredActiveRooms(LocalDateTime now) {
        return impl.findAllExpiredActiveRooms(now);
    }

    @Override
    public boolean existsBySurvey_IdAndIsOpenTrue(Long surveyId) {
        return impl.existsBySurvey_IdAndIsOpenTrue(surveyId);
    }

    @Override
    public Page<SurveyRoom> findByUserId(UUID userId, Pageable pageable) {
        return impl.findByUserId(userId, pageable);
    }
}
