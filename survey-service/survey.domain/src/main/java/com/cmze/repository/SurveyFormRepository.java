package com.cmze.repository;

import com.cmze.entity.SurveyForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface SurveyFormRepository {
    Optional<SurveyForm> findById(Long Id);
    Page<SurveyForm> findAll(Pageable pageable);
    Page<SurveyForm> findAllPublicAndOwnedByUser(UUID currentUserId, Pageable pageable);
    Page<SurveyForm> findByCreatorIdAndDeletedFalse(UUID creatorId, Pageable pageable);
    SurveyForm save(SurveyForm surveyForm);
}
