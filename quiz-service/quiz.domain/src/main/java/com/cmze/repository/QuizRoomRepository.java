package com.cmze.repository;

import com.cmze.entity.QuizRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizRoomRepository {
    boolean existsActiveRoomsForQuiz(Long quizFormId);
    Optional<QuizRoom> findById(UUID id);
    Optional<QuizRoom> findByIdWithQuiz(UUID id);
    QuizRoom save(QuizRoom quizRoom);
    Optional<QuizRoom> findByIdWithFullQuizStructure(UUID id);
    List<QuizRoom> findRoomsWithExpiredTimer(LocalDateTime now);
    List<QuizRoom> findAllExpiredActiveRooms(LocalDateTime now);
    Page<QuizRoom> findAllPublicActiveRooms(Pageable pageable);
    Page<QuizRoom> findByHostId(UUID hostId, Pageable pageable);
}
