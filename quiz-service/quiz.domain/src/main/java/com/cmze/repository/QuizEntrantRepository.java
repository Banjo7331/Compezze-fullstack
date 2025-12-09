package com.cmze.repository;

import com.cmze.entity.QuizEntrant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizEntrantRepository {
    boolean existsByQuizRoom_IdAndNickname(UUID roomId, String nickname);
    Optional<QuizEntrant> findByQuizRoom_IdAndUserId(UUID roomId, UUID userId);
    long countByQuizRoom_Id(UUID roomId);
    QuizEntrant save(QuizEntrant quizEntrant);
    List<QuizEntrant> findAllByQuizRoom_IdOrderByTotalScoreDesc(UUID roomId);
}
