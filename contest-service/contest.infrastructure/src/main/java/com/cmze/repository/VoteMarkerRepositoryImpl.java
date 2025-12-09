package com.cmze.repository;

import com.cmze.entity.VoteMarker;
import com.cmze.external.jpa.VoteMarkerJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class VoteMarkerRepositoryImpl implements VoteMarkerRepository {

    private final VoteMarkerJpaRepository impl;

    public VoteMarkerRepositoryImpl(VoteMarkerJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public boolean existsByStage_IdAndSubmission_IdAndParticipant_UserId(Long stageId, String submissionId, String userId) {
        return impl.existsByStage_IdAndSubmission_IdAndParticipant_UserId(stageId, submissionId, userId);
    }

    @Override
    public List<VoteMarker> findAllByStage_Id(Long stageId) {
        return impl.findAllByStage_Id(stageId);
    }

    @Override
    public VoteMarker save(VoteMarker voteMarker) {
        return impl.save(voteMarker);
    }
}
