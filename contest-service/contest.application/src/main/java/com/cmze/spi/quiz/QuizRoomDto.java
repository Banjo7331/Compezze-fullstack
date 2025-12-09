package com.cmze.spi.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizRoomDto {
    private String roomId;
    private Long userId;
}
