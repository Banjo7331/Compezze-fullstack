package com.cmze.entity.stagesettings;

import com.cmze.entity.Stage;
import com.cmze.enums.StageType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "stage_public")
@DiscriminatorValue("PUBLIC_VOTE")
public class PublicVoteStage extends Stage {

    @Column(nullable = false)
    private double weight = 1.0;

    @Column(nullable = false)
    private int maxScore = 1;


    @Override
    public StageType getType() {
        return StageType.PUBLIC_VOTE;
    }
}