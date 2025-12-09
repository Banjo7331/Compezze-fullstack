package com.cmze.spi.helpers.room;

import java.util.UUID;

public interface QuizResultCounter {
    FinalRoomResultsDto calculate(final UUID roomId);
}
