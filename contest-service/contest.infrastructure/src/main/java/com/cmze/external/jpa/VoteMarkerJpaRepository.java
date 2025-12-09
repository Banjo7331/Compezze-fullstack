package com.cmze.external.jpa;

import com.cmze.entity.VoteMarker;
import com.cmze.spi.ParticipantScoreDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VoteMarkerJpaRepository extends JpaRepository<VoteMarker, Long> {

    boolean existsByStage_IdAndSubmission_IdAndParticipant_UserId(Long stageId, String submissionId, String userId);

    List<VoteMarker> findAllByStage_Id(Long stageId);
}
