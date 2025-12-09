package com.cmze.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quiz_participants",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"quiz_room_id", "user_id"})
})
public class QuizEntrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String nickname;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_room_id")
    private QuizRoom quizRoom;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "total_score")
    private int totalScore = 0;

    @Column(name = "combo_streak")
    private int comboStreak = 0;

    @Column(name = "last_answer_correct")
    private boolean lastAnswerCorrect = false;
}
