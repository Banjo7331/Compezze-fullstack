package com.cmze.spi;

import com.cmze.entity.Stage;

import java.util.UUID;

public interface InvitationContext {
    String getInvitationToken(Stage stage, UUID userId);
}
