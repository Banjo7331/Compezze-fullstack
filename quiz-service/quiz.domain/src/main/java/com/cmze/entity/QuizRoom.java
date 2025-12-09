package com.cmze.entity;

import com.cmze.enums.QuizRoomStatus;
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
@Table(name = "quiz_room_results")
public class QuizRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_form_id")
    private QuizForm quiz;

    @Column(name = "host_user_id", nullable = false)
    private UUID hostId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuizRoomStatus status = QuizRoomStatus.LOBBY;

    @Column(name = "max_participants")
    @Min(1)
    @Max(1000)
    private Integer maxParticipants;

    @Column(name = "time_per_question", nullable = false)
    private Integer timePerQuestion;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = false;

    @Column(name = "current_question_index")
    private int currentQuestionIndex = -1;

    @Column(name = "current_question_start_time")
    private LocalDateTime currentQuestionStartTime;

    @Column(name = "current_question_end_time")
    private LocalDateTime currentQuestionEndTime;

    @OneToMany(mappedBy = "quizRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QuizEntrant> participants = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;
}
