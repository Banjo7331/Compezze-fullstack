package com.cmze.repository;

import com.cmze.entity.Question;
import com.cmze.external.jpa.QuestionJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class QuestionRepositoryImpl implements QuestionRepository {

    private final QuestionJpaRepository impl;

    @Autowired
    public QuestionRepositoryImpl(QuestionJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Optional<Question> findById(Long id) {
        return impl.findById(id);
    }

    @Override
    public Page<Question> findAllForSurvey(Long surveyId, Pageable pageable) {
        return impl.findBySurveyFormId(surveyId, pageable);
    }

    @Override
    public Question save(Question question) {
        return impl.save(question);
    }
}
