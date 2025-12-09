package com.cmze.repository;

import com.cmze.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuestionRepository {
    Question findById(Long Id);
    Page<Question> findAllForQuiz(Pageable pageable, Long quizId);
    Long save(Question question);
}
