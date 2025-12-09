package com.cmze.repository;

import com.cmze.entity.SurveyForm;
import com.cmze.external.jpa.SurveyFormJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class SurveyFormRepositoryImpl implements SurveyFormRepository {

    private final SurveyFormJpaRepository impl;

    public SurveyFormRepositoryImpl(final SurveyFormJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Optional<SurveyForm> findById(final Long id) {
        return impl.findById(id);
    }

    @Override
    public Page<SurveyForm> findAll(final Pageable pageable) {
        return impl.findAll(pageable);
    }

    @Override
    public Page<SurveyForm> findAllPublicAndOwnedByUser(final UUID currentUserId, final Pageable pageable) {
        return impl.findAllPublicAndOwnedByUser(currentUserId, pageable);
    }

    @Override
    public Page<SurveyForm> findByCreatorIdAndDeletedFalse(final UUID creatorId, final Pageable pageable) {
        return impl.findByCreatorIdAndDeletedFalse(creatorId, pageable);
    }

    @Override
    public SurveyForm save(final SurveyForm survey) {
        return impl.save(survey);
    }
}
