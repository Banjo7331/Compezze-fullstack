package com.cmze.repository;

import com.cmze.entity.Question;
import com.cmze.external.jpa.QuestionJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class QuestionRepositoryImpl implements QuestionRepository {

    private final QuestionJpaRepository impl;

    @Autowired
    public QuestionRepositoryImpl(QuestionJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Question findById(Long id) {
        return impl.findById(id).orElseThrow(()-> new RuntimeException("Question not found"));
    }

    @Override
    public Page<Question> findAllForQuiz(Pageable pageable, Long quizId) {
        return impl.findByQuizFormId(quizId, pageable);
    }

    @Override
    public Long save(Question question) {
        return impl.save(question).getId();
    }


}
