package com.cmze.entity.stagesettings;

import com.cmze.entity.Stage;
import com.cmze.enums.StageType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "stage_quiz")
@DiscriminatorValue("QUIZ")
public class QuizStage extends Stage {

    @Column(name = "quiz_form_id", nullable = false)
    private Long quizFormId;

    @Column(name = "active_room_id")
    private String activeRoomId;

    @Column(name = "max_participants")
    @Min(1)
    @Max(1000)
    private Integer maxParticipants = 100;

    @Column(name = "time_per_question")
    @Min(5)
    @Max(300)
    private Integer timePerQuestion = 30;

    @Column(name = "weight", nullable = false)
    private double weight = 1.0;

    @Override
    public StageType getType() {
        return StageType.QUIZ;
    }

}
