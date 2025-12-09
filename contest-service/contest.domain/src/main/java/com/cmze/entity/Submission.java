package com.cmze.entity;

import com.cmze.enums.SubmissionStatus;
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
@Table(name = "submissions",
        uniqueConstraints = {
                // np. jeden submission danego uczestnika w konkursie (jeśli taka zasada)
                @UniqueConstraint(name="uq_submission_contest_participant", columnNames={"contest_id","participant_id"})
        },
        indexes = {
                @Index(name = "ix_submission_contest", columnList = "contest_id"),
                @Index(name = "ix_submission_participant", columnList = "participant_id")
        }
)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Embedded
    private FileRef file;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class FileRef {
        @Column(name = "object_key", length = 512) // <- bez nullable=false
        private String objectKey;

        @Column(name = "bucket", length = 100)     // jeśli masz wiele bucketów
        private String bucket;

        @Column(name = "content_type", length = 100)
        private String contentType;

        @Column(name = "size_bytes")
        private Long size;
    }
}
