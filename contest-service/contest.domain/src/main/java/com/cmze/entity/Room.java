package com.cmze.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "live_rooms",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_live_room_contest", columnNames = {"contest_id"}),
                @UniqueConstraint(name = "uq_live_room_key", columnNames = {"room_key"})
        },
        indexes = {
                @Index(name = "ix_live_room_contest", columnList = "contest_id")
        }
)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @Column(name = "current_stage_position")
    private Integer currentStagePosition;

    @Column(name = "room_key", nullable = false, length = 120)
    private String roomKey;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "opened_by_participant_id", nullable = false)
    private Participant openedBy;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
