package com.cmze.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "survey_room_results")
public class SurveyRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToMany(mappedBy = "surveyRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SurveyEntrant> participants = new ArrayList<>();

    @Column(name = "max_participants")
    @Min(1)
    @Max(1000)
    private Integer maxParticipants;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_form_id")
    private SurveyForm survey;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = false;

    @Column(name = "is_open", nullable = false)
    private boolean isOpen = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
