package com.cmze.repository;

import com.cmze.entity.QuizForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Optional;
import java.util.UUID;

public interface QuizFormRepository {
    QuizForm save(QuizForm quizForm);
    Optional<QuizForm> findById(Long formId);
    Page<QuizForm> findAll(Specification<QuizForm> finalSpec, Pageable pageable);
    Page<QuizForm> findAllPublicAndOwnedByUser(UUID userId, Pageable pageable);
    Page<QuizForm> findByCreatorIdAndDeletedFalse(UUID creatorId, Pageable pageable);
}
