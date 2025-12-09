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
@Table(name = "survey_room_participants",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"survey_room_id", "user_id"})
        }
)
public class SurveyEntrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_room_id", nullable = false)
    private SurveyRoom surveyRoom;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @OneToOne(mappedBy = "participant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SurveyAttempt surveyAttempt;
}
