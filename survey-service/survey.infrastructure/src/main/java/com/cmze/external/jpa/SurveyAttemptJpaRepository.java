package com.cmze.external.jpa;

import com.cmze.entity.SurveyAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyAttemptJpaRepository extends JpaRepository<SurveyAttempt, Long> {
}
