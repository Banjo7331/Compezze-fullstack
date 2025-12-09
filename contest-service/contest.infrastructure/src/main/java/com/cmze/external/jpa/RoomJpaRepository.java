package com.cmze.external.jpa;

import com.cmze.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoomJpaRepository extends JpaRepository<Room, String> {
    Optional<Room> findByRoomKey(String roomKey);
    boolean existsByRoomKey(String roomKey);

    @Query("SELECT r FROM Room r WHERE r.contest.id = :contestId AND r.active = true")
    Optional<Room> findByContest_Id(@Param("contestId") Long contestId);

    boolean existsByContest_IdAndActiveTrue(Long contestId);
}
