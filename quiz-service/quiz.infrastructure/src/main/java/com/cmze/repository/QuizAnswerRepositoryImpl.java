package com.cmze.repository;

import com.cmze.entity.QuizAnswer;
import com.cmze.external.jpa.QuizAnswerJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class QuizAnswerRepositoryImpl implements QuizAnswerRepository {

    private final QuizAnswerJpaRepository impl;

    public QuizAnswerRepositoryImpl(QuizAnswerJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public boolean existsByUserIdAndRoomIdAndQuestionIndex(UUID userId, UUID roomId, int questionIndex) {
        return impl.existsByUserIdAndRoomIdAndQuestionIndex(userId, roomId, questionIndex);
    }

    @Override
    public long countByRoomIdAndQuestionIndex(UUID roomId, int questionIndex) {
        return impl.countByRoomIdAndQuestionIndex(roomId, questionIndex);
    }

    @Override
    public QuizAnswer save(QuizAnswer quizAnswer) {
        return impl.save(quizAnswer);
    }
}
