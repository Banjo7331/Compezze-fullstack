package com.cmze.external.jpa;

import com.cmze.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParticipantJpaRepository  extends JpaRepository<Participant, Long> {

    @Query("SELECT p FROM Participant p WHERE p.contest.id = :contestId AND p.userId = :userId")
    Optional<Participant> findByContestIdAndUserId(@Param("contestId") Long contestId,
                                                   @Param("userId") String userId);
    long countByContest_Id(Long contestId);

    List<Participant> findAllByContest_Id(Long contestId);

    List<Participant> findByContest_IdAndDisplayNameContainingIgnoreCase(Long contestId, String query);

}
