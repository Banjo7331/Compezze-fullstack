package com.cmze.repository;

import com.cmze.entity.Room;
import com.cmze.external.jpa.RoomJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class RoomRepositoryImpl implements RoomRepository {

    private final RoomJpaRepository impl;

    public RoomRepositoryImpl(RoomJpaRepository impl) {
        this.impl = impl;
    }

    @Override
    public boolean existsByRoomKey(String roomKey) {
        return impl.existsByRoomKey(roomKey);
    }

    @Override
    public Optional<Room> findByRoomKey(String roomKey) {
        return impl.findByRoomKey(roomKey);
    }

    @Override
    public Optional<Room> findById(String roomId) {
        return impl.findById(roomId);
    }

    @Override
    public Optional<Room> findByContest_Id(Long contestId) {
        return impl.findByContest_Id(contestId);
    }

    @Override
    public Room save(Room room) {
        return impl.save(room);
    }

    @Override
    public boolean existsByContest_IdAndActiveTrue(Long contestId) {
        return impl.existsByContest_IdAndActiveTrue(contestId);
    }
}
