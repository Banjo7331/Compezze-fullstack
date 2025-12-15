package com.cmze.repository;

import com.cmze.entity.Submission;
import com.cmze.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository{
    Optional<Submission> findByIdAndContest_Id(String submissionId, Long contestId);

    List<Submission> findAllByContest_IdAndStatus(Long contestId, SubmissionStatus status);

    Submission save(Submission submission);

    void delete(Submission submission);

    Page<Submission> findByContest_IdAndStatus(Long contestId, SubmissionStatus status, Pageable pageable);

    Page<Submission> findByContest_Id(Long contestId, Pageable pageable);

    Optional<Submission> findByContest_IdAndParticipantId(Long contestId, Long participantId);

    List<Submission> findAllApprovedByContestId(Long contestId);

    List<Submission> findAllByIdIn(Collection<String> ids);
}
