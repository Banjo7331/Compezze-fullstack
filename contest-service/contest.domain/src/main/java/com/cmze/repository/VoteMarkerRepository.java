package com.cmze.repository;

import com.cmze.entity.VoteMarker;

import java.util.List;

public interface VoteMarkerRepository {
    boolean existsByStage_IdAndSubmission_IdAndParticipant_UserId(Long stageId, String submissionId, String userId);

    List<VoteMarker> findAllByStage_Id(Long stageId);

    VoteMarker save(VoteMarker voteMarker);
}
