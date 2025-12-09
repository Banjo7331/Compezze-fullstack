package com.cmze.external.jpa;

import com.cmze.entity.SurveyForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SurveyFormJpaRepository extends JpaRepository<SurveyForm, Long> {
    @Query(value = "SELECT sf FROM SurveyForm sf " +
            "WHERE sf.deleted = false " +
            "AND (" +
            "   sf.isPrivate = false " +
            "   OR (sf.isPrivate = true AND sf.creatorId = :currentUserId)" +
            ")",

            countQuery = "SELECT count(sf) FROM SurveyForm sf " +
                    "WHERE sf.deleted = false " +
                    "AND (" +
                    "   sf.isPrivate = false " +
                    "   OR (sf.isPrivate = true AND sf.creatorId = :currentUserId)" +
                    ")")
    Page<SurveyForm> findAllPublicAndOwnedByUser(@Param("currentUserId") UUID currentUserId, Pageable pageable);

    Page<SurveyForm> findByCreatorIdAndDeletedFalse(UUID creatorId, Pageable pageable);
}
