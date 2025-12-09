package com.cmze.external.jpa;

import com.cmze.entity.QuizRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizRoomJpaRepository extends JpaRepository<QuizRoom, UUID> {

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM QuizRoom r WHERE r.quiz.id = :quizFormId AND r.status != 'FINISHED'")
    boolean existsActiveRoomsForQuiz(@Param("quizFormId") Long quizFormId);

    Page<QuizRoom> findByHostId(UUID hostId, Pageable pageable);

    @Query("SELECT r FROM QuizRoom r " +
            "LEFT JOIN FETCH r.quiz q " +
            "LEFT JOIN FETCH q.questions qs " +
            "WHERE r.id = :id")
    Optional<QuizRoom> findByIdWithQuiz(@Param("id") UUID id);

    @Query("SELECT r FROM QuizRoom r " +
            "LEFT JOIN FETCH r.quiz q " +
            "LEFT JOIN FETCH q.questions qs " +
            "LEFT JOIN FETCH qs.options " +
            "WHERE r.id = :id")
    Optional<QuizRoom> findByIdWithFullQuizStructure(@Param("id") UUID id);

    @Query("SELECT r FROM QuizRoom r " +
            "LEFT JOIN FETCH r.quiz q " +
            "LEFT JOIN FETCH q.questions qs " +
            "LEFT JOIN FETCH qs.options " +
            "WHERE r.currentQuestionEndTime < :now " +
            "AND (r.status = 'QUESTION_ACTIVE' OR r.status = 'QUESTION_FINISHED')")
    List<QuizRoom> findRoomsWithExpiredTimer(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM QuizRoom r WHERE r.status != 'FINISHED' AND r.validUntil < :now")
    List<QuizRoom> findAllExpiredActiveRooms(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM QuizRoom r WHERE r.isPrivate = false AND r.status != 'FINISHED'")
    Page<QuizRoom> findAllPublicActiveRooms(Pageable pageable);
}
