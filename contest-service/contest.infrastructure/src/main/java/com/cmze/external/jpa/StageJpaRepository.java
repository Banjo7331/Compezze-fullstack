package com.cmze.external.jpa;

import com.cmze.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StageJpaRepository extends JpaRepository<Stage, Long> {
    List<Stage> findAllByContest_IdOrderByPositionAsc(Long contestId);

    Optional<Stage> findByContest_IdAndPosition(Long contestId, int position);

    Optional<Stage> findFirstByContest_IdAndPositionGreaterThanOrderByPositionAsc(Long contestId, int position);
}
