package com.cmze.external.jpa;

import com.cmze.entity.QuizForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface QuizFormJpaRepository extends JpaRepository<QuizForm, Long>, JpaSpecificationExecutor<QuizForm> {
    @Query(value = "SELECT q FROM QuizForm q " +
            "WHERE q.deleted = false " +
            "AND (" +
            "   q.isPrivate = false " +
            "   OR (q.isPrivate = true AND q.creatorId = :userId)" +
            ")",
            countQuery = "SELECT count(q) FROM QuizForm q " +
                    "WHERE q.deleted = false " +
                    "AND (" +
                    "   q.isPrivate = false " +
                    "   OR (q.isPrivate = true AND q.creatorId = :userId)" +
                    ")")
    Page<QuizForm> findAllPublicAndOwnedByUser(@Param("userId") UUID userId, Pageable pageable);

    Page<QuizForm> findByCreatorIdAndDeletedFalse(UUID creatorId, Pageable pageable);
}
