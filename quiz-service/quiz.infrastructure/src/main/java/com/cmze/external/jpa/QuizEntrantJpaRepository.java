package com.cmze.external.jpa;

import com.cmze.entity.QuizEntrant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizEntrantJpaRepository extends JpaRepository<QuizEntrant, Long> {
    boolean existsByQuizRoom_IdAndNickname(UUID roomId, String nickname);

    Optional<QuizEntrant> findByQuizRoom_IdAndUserId(UUID roomId, UUID userId);

    long countByQuizRoom_Id(UUID roomId);

    List<QuizEntrant> findAllByQuizRoom_IdOrderByTotalScoreDesc(UUID roomId);
}
