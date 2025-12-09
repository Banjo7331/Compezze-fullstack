package com.cmze.entity;

import com.cmze.enums.StageType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "stages")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "stage_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Stage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Min(1)
    private int durationMinutes;

    @Min(1)
    private int position;

    @Transient
    public abstract StageType getType();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;
}
