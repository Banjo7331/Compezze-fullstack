package com.cmze.spi.helpers;

import java.util.UUID;

public interface SoulboundTokenService {
    String mintInvitationToken(Long contestId, UUID targetUserId);

    boolean validateSoulboundToken(String token, UUID currentUserId, Long currentContestId);
}