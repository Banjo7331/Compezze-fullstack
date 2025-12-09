package com.cmze.internal.ws;

import com.cmze.repository.QuizEntrantRepository;
import com.cmze.repository.QuizRoomRepository;
import com.cmze.spi.helpers.room.FinalRoomResultsDto;
import com.cmze.spi.helpers.room.LeaderboardEntryDto;
import com.cmze.spi.helpers.room.QuizResultCounter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class QuizResultCounterImpl implements QuizResultCounter {

    private final QuizEntrantRepository quizEntrantRepository;
    private final QuizRoomRepository quizRoomRepository;

    public QuizResultCounterImpl(final QuizEntrantRepository quizEntrantRepository,
                                 final QuizRoomRepository quizRoomRepository) {
        this.quizEntrantRepository = quizEntrantRepository;
        this.quizRoomRepository = quizRoomRepository;
    }

    @Override
    public FinalRoomResultsDto calculate(final UUID roomId) {

        final var room = quizRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        final var hostId = room.getHostId();

        final var allEntrants = quizEntrantRepository.findAllByQuizRoom_IdOrderByTotalScoreDesc(roomId);

        final var playersOnly = allEntrants.stream()
                .filter(entrant -> !entrant.getUserId().equals(hostId))
                .toList();

        final var leaderboard = new ArrayList<LeaderboardEntryDto>();
        int rank = 1;

        for (final var entrant : playersOnly) {
            leaderboard.add(new LeaderboardEntryDto(
                    entrant.getUserId(),
                    entrant.getNickname(),
                    entrant.getTotalScore(),
                    rank++
            ));
        }

        return new FinalRoomResultsDto(
                (long) playersOnly.size(),
                leaderboard
        );
    }
}
