package com.cmze.repository;

import com.cmze.entity.Contest;
import com.cmze.external.jpa.ContestJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class ContestRepositoryImpl implements ContestRepository{

    private final ContestJpaRepository impl;

    @Autowired
    public ContestRepositoryImpl(ContestJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public Optional<Contest> findById(Long id) {
        return impl.findById(id);
    }


    @Override
    public Page<Contest> findAll(Pageable pageable, Long quizId) {
        return impl.findAll(pageable);
    }

    @Override
    public Contest save(Contest contest) {
        return impl.save(contest);
    }

    @Override
    public Page<Contest> findUpcomingForUser(String userId, LocalDateTime cutOffDate, Pageable pageable) {
        return impl.findUpcomingForUser(userId, cutOffDate, pageable);
    }

    @Override
    public Page<Contest> findPublicContestsToJoin(LocalDateTime now,Pageable pageable) {
        return impl.findPublicContestsToJoin(now, pageable);
    }

}
