package com.cmze.internal.service.voting.strategy;

import com.cmze.entity.Participant;
import com.cmze.entity.Stage;
import com.cmze.entity.Submission;
import com.cmze.enums.StageType;

public interface VotingStrategy {

    StageType getStageType();

    void vote(Stage stage, Participant voter, Submission submission, int score);
}
