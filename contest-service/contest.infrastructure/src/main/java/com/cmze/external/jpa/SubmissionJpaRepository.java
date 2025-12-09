package com.cmze.external.jpa;

import com.cmze.entity.Submission;
import com.cmze.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}