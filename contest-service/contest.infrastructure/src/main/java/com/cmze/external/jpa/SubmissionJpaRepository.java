package com.cmze.external.jpa;

import com.cmze.entity.Submission;
import com.cmze.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SubmissionJpaRepository extends JpaRepository<Submission, String> {
    boolean existsByContest_IdAndParticipantId(Long contestId, Long participantId);
    long countByContest_Id(Long contestId);
    List<Submission> findAllByContest_IdAndStatus(Long contestId, SubmissionStatus status);

    Page<Submission> findByContest_IdAndStatus(Long contestId, SubmissionStatus status, Pageable pageable);

    Page<Submission> findByContest_Id(Long contestId, Pageable pageable);

    Optional<Submission> findByContest_IdAndParticipantId(Long contestId, Long participantId);

    Optional<Submission> findByIdAndContest_Id(String id, Long contestId);

    @Query("SELECT s FROM Submission s " +
            "WHERE s.participant.contest.id = :contestId " +  // Ścieżka do Contest ID (zależy od Twoich encji!)
            "AND s.status = 'APPROVED'")
    List<Submission> findAllApprovedByContestId(@Param("contestId") Long contestId);

    List<Submission> findAllByIdIn(Collection<String> ids);
}