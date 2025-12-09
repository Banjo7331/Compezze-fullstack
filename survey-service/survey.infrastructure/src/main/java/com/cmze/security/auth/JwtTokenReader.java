package com.cmze.security.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.List;
import java.util.UUID;

@Component
public class JwtTokenReader {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenReader.class);

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith((SecretKey) key())
                    .build()
                    .parse(token);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    private Claims getAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID getUserId(String token) {
        String subject = getAllClaims(token).getSubject();
        return UUID.fromString(subject);
    }

    public String getUsername(String token) {
        return getAllClaims(token).get("username", String.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        return getAllClaims(token).get("roles", List.class);
    }
}
