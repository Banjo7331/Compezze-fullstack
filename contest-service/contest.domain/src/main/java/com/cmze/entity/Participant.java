package com.cmze.entity;

import com.cmze.enums.ContestRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "participants",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_participant_contest_user", columnNames = {"contest_id", "user_id"})
        },
        indexes = {
                @Index(name = "ix_participant_contest", columnList = "contest_id"),
                @Index(name = "ix_participant_user", columnList = "user_id")
        }
)
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @Column(name = "user_id", length = 100, nullable = false)
    private String userId;

    @Column(name = "total_score", nullable = false)
    private long totalScore = 0L;

    @Size(max = 100)
    @Column(name = "display_name")
    private String displayName;

    @Size(max = 500)
    @Column(name = "bio")
    private String bio;

    @Column(name = "avatar_key", length = 120)
    private String avatarKey;

    @ElementCollection(fetch = FetchType.EAGER) // Eager, bo często sprawdzamy uprawnienia
    @CollectionTable(name = "participant_roles", joinColumns = @JoinColumn(name = "participant_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<ContestRole> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
