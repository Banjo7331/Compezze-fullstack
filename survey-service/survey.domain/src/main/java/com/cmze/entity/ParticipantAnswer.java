package com.cmze.entity;

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
@Table(name = "survey_participant_answers") // Zmieniono nazwę
public class ParticipantAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "participant_answer_choices", joinColumns = @JoinColumn(name = "participant_answer_id")) // Zmieniono nazwę
    @Column(name = "answer")
    private List<String> answer = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_attempt_id", nullable = false)
    private SurveyAttempt surveyAttempt;
}
