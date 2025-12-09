package com.cmze.entity.stagesettings;

import com.cmze.entity.Stage;
import com.cmze.enums.JuryRevealMode;
import com.cmze.enums.StageType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "stage_jury")
@DiscriminatorValue("JURY_VOTE")
public class JuryVoteStage extends Stage {

    @Column(nullable = false)
    private double weight = 1.0;

    @Column(nullable = false)
    private int maxScore = 10;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JuryRevealMode juryRevealMode = JuryRevealMode.IMMEDIATE;

    @Column(nullable = false)
    private boolean showJudgeNames = true;

    @Override
    public StageType getType() {
        return StageType.JURY_VOTE;
    }
}
