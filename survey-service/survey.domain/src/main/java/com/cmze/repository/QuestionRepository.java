package com.cmze.repository;

import com.cmze.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface QuestionRepository {
    Optional<Question> findById(Long id);
    Page<Question> findAllForSurvey(Long surveyId, Pageable pageable);
    Question save(Question question);
}
