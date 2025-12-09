package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyQuizFormResponse {
    private Long id;
    private String title;
    private boolean isPrivate;
    private LocalDateTime createdAt;
    private int questionsCount;
}
