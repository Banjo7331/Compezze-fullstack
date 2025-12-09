package com.cmze.repository;

import com.cmze.entity.SurveyAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface SurveyAttemptRepository {
    Optional<SurveyAttempt> findById(Long Id);
    Page<SurveyAttempt> findAll(Pageable pageable);
    SurveyAttempt save(SurveyAttempt surveyAttempt);
}
