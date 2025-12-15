package com.cmze.repository;

import com.cmze.entity.QuizRoom;
import com.cmze.external.jpa.QuizRoomJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class QuizRoomRepositoryImpl implements QuizRoomRepository {

    private final QuizRoomJpaRepository impl;

    public QuizRoomRepositoryImpl(QuizRoomJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public boolean existsActiveRoomsForQuiz(Long quizFormId) {
        return impl.existsActiveRoomsForQuiz(quizFormId);
    }

    @Override
    public Optional<QuizRoom> findById(UUID id) {
        return impl.findById(id);
    }

    @Override
    public Optional<QuizRoom> findByIdWithQuiz(UUID id) {
        return impl.findByIdWithQuiz(id);
    }

    @Override
    public QuizRoom save(QuizRoom quizRoom) {
        return impl.save(quizRoom);
    }

    @Override
    public Optional<QuizRoom> findByIdWithFullQuizStructure(UUID id) {
        return impl.findByIdWithFullQuizStructure(id);
    }

    @Override
    public List<QuizRoom> findRoomsWithExpiredTimer(LocalDateTime now) {
        return impl.findRoomsWithExpiredTimer(now);
    }

    @Override
    public List<QuizRoom> findAllExpiredActiveRooms(LocalDateTime now) {
        return impl.findAllExpiredActiveRooms(now);
    }

    @Override
    public Page<QuizRoom> findAllPublicActiveRooms(Pageable pageable) {
        return impl.findAllPublicActiveRooms(pageable);
    }

    @Override
    public Page<QuizRoom> findByHostId(UUID hostId, Pageable pageable) {
        return impl.findByHostId(hostId, pageable);
    }

    @Override
    public Page<QuizRoom> findAll(Specification<QuizRoom> specification, Pageable pageable) {
        return impl.findAll(specification, pageable);
    }
}
