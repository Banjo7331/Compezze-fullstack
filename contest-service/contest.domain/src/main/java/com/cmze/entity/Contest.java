package com.cmze.entity;

import com.cmze.enums.ContestCategory;
import com.cmze.enums.ContestStatus;
import com.cmze.enums.SubmissionMediaPolicy;
import jakarta.persistence.*;

import jakarta.validation.constraints.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contests")
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Contest name must not be blank")
    @Size(min = 3, max = 100, message = "Contest name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Contest description must not be blank")
    @Size(max = 1000, message = "Description can be up to 1000 characters")
    private String description;

    @Size(max = 255, message = "Location can be up to 255 characters")
    private String location;

    @NotNull()
    @Enumerated(EnumType.STRING)
    private ContestCategory contestCategory;

    @Min(value = 1, message = "Participant limit must be greater than 0")
    private Integer participantLimit;

    @NotNull()
    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDateTime startDate;

    @NotNull()
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;

    private boolean isPrivate = false;

    private boolean hasPreliminaryStage = false;

    @NotNull()
    private boolean isOpen = true;

    private boolean contentVerified = false;

    @NotNull()
    private String organizerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "submission_media_policy", nullable = false)
    private SubmissionMediaPolicy submissionMediaPolicy = SubmissionMediaPolicy.BOTH;

    @NotNull()
    @Enumerated(EnumType.STRING)
    private ContestStatus status;

    @Column(name = "cover_image_key")
    private String coverImageKey;

    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, fetch = FetchType.LAZY) // <--- POPRAWKA
    private List<Submission> submissions = new ArrayList<>();

    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Stage> stages = new ArrayList<>();

    @OneToMany(mappedBy = "contest", fetch = FetchType.LAZY)
    private List<Participant> participants = new ArrayList<>();

}

