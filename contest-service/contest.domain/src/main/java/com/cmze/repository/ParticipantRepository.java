package com.cmze.repository;

import com.cmze.entity.Participant;

import java.util.List;
import java.util.Optional;

public interface ParticipantRepository {
    Participant save(Participant participant);

    Optional<Participant> findByContestIdAndUserId(Long contestId, String userId);

    long countByContest_Id(Long contestId);

    List<Participant> findAllByContest_Id(Long contestId);

    List<Participant> findByContest_IdAndDisplayNameContainingIgnoreCase(Long contestId, String query);
}
