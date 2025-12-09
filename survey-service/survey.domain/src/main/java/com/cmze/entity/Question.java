package com.cmze.entity;

import com.cmze.enums.QuestionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "survey_questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_choices", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "choice")
    private Set<String> possibleChoices = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_form_id", nullable = false)
    private SurveyForm surveyForm;
}
