package com.cmze.repository;

import com.cmze.entity.Stage;
import com.cmze.external.jpa.StageJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class StageRepositoryImpl implements StageRepository {

    private final StageJpaRepository impl;

    public StageRepositoryImpl(StageJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Optional<Stage> findById(Long id) {
        return impl.findById(id);
    }

    @Override
    public Stage save(Stage stage) {
        return impl.save(stage);
    }
}
