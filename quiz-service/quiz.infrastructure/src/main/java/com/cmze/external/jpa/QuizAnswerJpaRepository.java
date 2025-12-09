package com.cmze.external.jpa;

import com.cmze.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface QuizAnswerJpaRepository extends JpaRepository<QuizAnswer, Long> {

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM QuizAnswer a " +
            "WHERE a.entrant.userId = :userId " +
            "AND a.entrant.quizRoom.id = :roomId " +
            "AND a.questionIndex = :questionIndex")
    boolean existsByUserIdAndRoomIdAndQuestionIndex(@Param("userId") UUID userId,
                                                    @Param("roomId") UUID roomId,
                                                    @Param("questionIndex") int questionIndex);

    @Query("SELECT COUNT(a) FROM QuizAnswer a " +
            "WHERE a.entrant.quizRoom.id = :roomId AND a.questionIndex = :questionIndex")
    long countByRoomIdAndQuestionIndex(@Param("roomId") UUID roomId, @Param("questionIndex") int questionIndex);
}
