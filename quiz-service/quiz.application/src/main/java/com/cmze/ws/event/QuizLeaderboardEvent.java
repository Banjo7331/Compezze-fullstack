package com.cmze.ws.event;

import com.cmze.spi.helpers.room.LeaderboardEntryDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class QuizLeaderboardEvent {
    private final UUID roomId;
    private final List<LeaderboardEntryDto> topPlayers;
}
