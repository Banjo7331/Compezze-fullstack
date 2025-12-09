package com.cmze.repository;

import com.cmze.entity.QuizForm;
import com.cmze.external.jpa.QuizFormJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class QuizFormRepositoryImpl implements QuizFormRepository {

    private final QuizFormJpaRepository impl;

    public QuizFormRepositoryImpl(QuizFormJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public QuizForm save(QuizForm quizForm) {
        return impl.save(quizForm);
    }

    @Override
    public Optional<QuizForm> findById(Long formId) {
        return impl.findById(formId);
    }

    @Override
    public Page<QuizForm> findAllPublicAndOwnedByUser(UUID userId, Pageable pageable) {
        return impl.findAllPublicAndOwnedByUser(userId, pageable);
    }

    @Override
    public Page<QuizForm> findByCreatorIdAndDeletedFalse(UUID creatorId, Pageable pageable) {
        return impl.findByCreatorIdAndDeletedFalse(creatorId, pageable);
    }
}
