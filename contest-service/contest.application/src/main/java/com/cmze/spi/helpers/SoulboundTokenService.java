package com.cmze.spi.helpers;

import java.util.UUID;

public interface SoulboundTokenService {
    String mintInvitationToken(UUID roomId, UUID targetUserId);

    boolean validateSoulboundToken(String token, UUID currentUserId, UUID currentRoomId);
}
