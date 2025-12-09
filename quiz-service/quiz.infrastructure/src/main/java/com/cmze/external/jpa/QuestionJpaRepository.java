package com.cmze.external.jpa;

import com.cmze.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionJpaRepository extends JpaRepository<Question, Long> {
    Page<Question> findByQuizFormId(Long quizId, Pageable pageable);
}
