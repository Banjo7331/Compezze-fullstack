package com.cmze.repository;

import com.cmze.entity.Participant;
import com.cmze.external.jpa.ParticipantJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ParticipantRepositoryImpl implements ParticipantRepository{

    private final ParticipantJpaRepository impl;

    @Autowired
    public ParticipantRepositoryImpl(ParticipantJpaRepository impl) {
        this.impl = impl;
    }

//    @Override
//    public boolean existsByContestIdAndUserId(String contestId, String userId) {
//        return false;
//    }

    @Override
    public Participant save(Participant participant) {
        return impl.save(participant);
    }

    @Override
    public Optional<Participant> findByContestIdAndUserId(Long contestId, String userId) {
        return impl.findByContestIdAndUserId(contestId, userId);
    }

    @Override
    public long countByContest_Id(Long contestId) {
        return impl.countByContest_Id(contestId);
    }

    @Override
    public List<Participant> findAllByContest_Id(Long contestId) {
        return impl.findAllByContest_Id(contestId);
    }

    @Override
    public List<Participant> findByContest_IdAndDisplayNameContainingIgnoreCase(Long contestId, String query) {
        return impl.findByContest_IdAndDisplayNameContainingIgnoreCase(contestId, query);
    }

}
