package com.cmze.security.session;

import com.cmze.spi.helpers.SoulboundTokenService;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class SoulboundTokenServiceImpl implements SoulboundTokenService {

    private static final Logger logger = LoggerFactory.getLogger(SoulboundTokenServiceImpl.class);
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24;

    private final SecretKey key;

    public SoulboundTokenServiceImpl(@Value("${app.jwt-secret}") final String jwtSecret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    @Override
    public String mintInvitationToken(final UUID roomId, final UUID targetUserId) {
        final var now = new Date();
        final var expiryDate = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .subject(targetUserId.toString())
                .claim("roomId", roomId.toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    @Override
    public boolean validateSoulboundToken(final String token, final UUID currentUserId, final UUID currentRoomId) {
        try {
            final var claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            final var boundUserId = claims.getSubject();
            final var boundRoomId = claims.get("roomId", String.class);

            if (!boundRoomId.equals(currentRoomId.toString())) {
                logger.warn("Token valid but for wrong room. Expected: {}, Got: {}", currentRoomId, boundRoomId);
                return false;
            }

            if (!boundUserId.equals(currentUserId.toString())) {
                logger.warn("Soulbound breach attempt! User {} tried to use ticket belonging to {}", currentUserId, boundUserId);
                return false;
            }

            return true;

        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Invalid invitation token: {}", e.getMessage());
            return false;
        }
    }
}

