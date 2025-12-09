package com.cmze.repository;

import com.cmze.entity.Stage;

import java.util.Optional;

public interface StageRepository {
    Optional<Stage> findById(Long id);
    Stage save(Stage stage);
}
