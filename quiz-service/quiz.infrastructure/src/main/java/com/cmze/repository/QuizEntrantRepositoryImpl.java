package com.cmze.repository;

import com.cmze.entity.QuizEntrant;
import com.cmze.external.jpa.QuizEntrantJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class QuizEntrantRepositoryImpl implements QuizEntrantRepository {

    private final QuizEntrantJpaRepository impl;

    public QuizEntrantRepositoryImpl(QuizEntrantJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public boolean existsByQuizRoom_IdAndNickname(UUID roomId, String nickname) {
        return impl.existsByQuizRoom_IdAndNickname(roomId, nickname);
    }

    @Override
    public Optional<QuizEntrant> findByQuizRoom_IdAndUserId(UUID roomId, UUID userId) {
        return impl.findByQuizRoom_IdAndUserId(roomId, userId);
    }

    @Override
    public long countByQuizRoom_Id(UUID roomId) {
        return impl.countByQuizRoom_Id(roomId);
    }

    @Override
    public QuizEntrant save(QuizEntrant quizEntrant) {
        return impl.save(quizEntrant);
    }

    @Override
    public List<QuizEntrant> findAllByQuizRoom_IdOrderByTotalScoreDesc(UUID roomId) {
        return impl.findAllByQuizRoom_IdOrderByTotalScoreDesc(roomId);
    }
}
