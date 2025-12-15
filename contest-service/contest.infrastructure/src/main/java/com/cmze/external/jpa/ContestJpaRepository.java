package com.cmze.external.jpa;

import com.cmze.entity.Contest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ContestJpaRepository extends JpaRepository<Contest, Long>, JpaSpecificationExecutor<Contest> {

    @Query("SELECT c FROM Contest c " +
            "LEFT JOIN c.participants p " +
            "WHERE (c.organizerId = :userId OR p.userId = :userId) " +
            "AND c.status != 'FINISHED' " +
            "AND c.startDate > :cutoffDate " +
            "ORDER BY c.startDate ASC")
    Page<Contest> findUpcomingForUser(@Param("userId") String userId,
                                      @Param("cutoffDate") LocalDateTime cutoffDate,
                                      Pageable pageable);

    @Query("SELECT c FROM Contest c " +
            "WHERE c.isPrivate = false " +
            "AND (c.status = 'CREATED' OR c.status = 'DRAFT') " +
            "AND c.startDate > :now " +
            "AND (c.participantLimit IS NULL OR (SELECT COUNT(p) FROM Participant p WHERE p.contest = c) < c.participantLimit)")
    Page<Contest> findPublicContestsToJoin(@Param("now") LocalDateTime now, Pageable pageable);


    Page<Contest> findAllByOrganizerId(String organizerId, Pageable pageable);
}
