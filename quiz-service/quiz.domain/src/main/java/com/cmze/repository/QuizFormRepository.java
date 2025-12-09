package com.cmze.repository;

import com.cmze.entity.QuizForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface QuizFormRepository {
    QuizForm save(QuizForm quizForm);
    Optional<QuizForm> findById(Long formId);
    Page<QuizForm> findAllPublicAndOwnedByUser(UUID userId, Pageable pageable);
    Page<QuizForm> findByCreatorIdAndDeletedFalse(UUID creatorId, Pageable pageable);
}
