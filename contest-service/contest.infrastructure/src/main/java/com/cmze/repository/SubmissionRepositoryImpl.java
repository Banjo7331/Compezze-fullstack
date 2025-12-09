package com.cmze.repository;

import com.cmze.entity.Submission;
import com.cmze.enums.SubmissionStatus;
import com.cmze.external.jpa.SubmissionJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SubmissionRepositoryImpl implements SubmissionRepository {

    private final SubmissionJpaRepository impl;

    public SubmissionRepositoryImpl(SubmissionJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Optional<Submission> findByIdAndContest_Id(String submissionId, Long contestId) {
        return impl.findByIdAndContest_Id(submissionId, contestId);
    }

    @Override
    public List<Submission> findAllByContest_IdAndStatus(Long contestId, SubmissionStatus status) {
        return impl.findAllByContest_IdAndStatus(contestId, status);
    }

    @Override
    public Submission save(Submission submission) {
        return impl.save(submission);
    }

    @Override
    public void delete(Submission submission) {
        impl.delete(submission);
    }

    @Override
    public Page<Submission> findByContest_IdAndStatus(Long contestId, SubmissionStatus status, Pageable pageable) {
        return impl.findByContest_IdAndStatus(contestId, status, pageable);
    }

    @Override
    public Page<Submission> findByContest_Id(Long contestId, Pageable pageable) {
        return impl.findByContest_Id(contestId, pageable);
    }

    @Override
    public Optional<Submission> findByContest_IdAndParticipantId(Long contestId, Long participantId) {
        return impl.findByContest_IdAndParticipantId(contestId, participantId);
    }
}
