package com.cmze.repository;

import com.cmze.entity.Contest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ContestRepository {
    Optional<Contest> findById(Long id);

    Page<Contest> findAll(Pageable pageable, Long quizId);

    Contest save(Contest contest);

    Page<Contest> findUpcomingForUser(String userId, LocalDateTime cutoffDate, Pageable pageable);

    Page<Contest> findPublicContestsToJoin(LocalDateTime now, Pageable pageable);
}
