package com.cmze.spi.helpers.room;

import java.util.UUID;

public interface SurveyResultCounter {
    FinalRoomResultDto calculate(UUID roomId);
}
