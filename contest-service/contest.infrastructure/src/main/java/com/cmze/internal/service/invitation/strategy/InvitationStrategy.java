package com.cmze.internal.service.invitation.strategy;

import com.cmze.entity.Stage;
import com.cmze.enums.StageType;

import java.util.UUID;

public interface InvitationStrategy {
    StageType getStageType();
    String getAccessToken(Stage stage, UUID userId);
}
