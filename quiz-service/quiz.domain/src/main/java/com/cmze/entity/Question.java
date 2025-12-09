package com.cmze.entity;

import com.cmze.enums.QuestionLevel;
import com.cmze.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quiz_questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @Column(name = "points", nullable = false)
    private Integer points = 1000;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_form_id")
    private QuizForm quizForm;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<QuizQuestionOption> options = new ArrayList<>();
}
