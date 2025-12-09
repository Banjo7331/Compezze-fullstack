package com.cmze.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quiz_answers")
public class QuizAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrant_id")
    private QuizEntrant entrant;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "question_index")
    private int questionIndex;

    @Column(name = "selected_option_id")
    private Long selectedOptionId;

    @Column(name = "time_taken_ms")
    private long timeTakenMs;

    @Column(name = "is_correct")
    private boolean isCorrect;

    @Column(name = "points_awarded")
    private int pointsAwarded;
}