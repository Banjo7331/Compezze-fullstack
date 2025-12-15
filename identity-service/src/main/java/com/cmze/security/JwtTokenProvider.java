package com.cmze.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-milliseconds}")
    private long jwtExpirationDate;

    @Value("${app.jwt-refresh-expiration-milliseconds}")
    private long jwtRefreshExpirationDate;

    public String generateToken(Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String userId = userDetails.getId().toString();
        String username = userDetails.getUsername();
        String email = userDetails.getEmail();

        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String token = Jwts.builder()
                .subject(userId)
                .issuedAt(new Date())
                .expiration(expireDate)
                .signWith(key())
                .claim("roles", roles)
                .claim("username", username)
                .claim("email", email)
                .compact();

        return token;
    }

    public String generateRefreshToken(Authentication authentication) {
        String userId = ((CustomUserDetails) authentication.getPrincipal()).getId().toString();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtRefreshExpirationDate);

        return Jwts.builder()
                .subject(userId)
                .issuedAt(new Date())
                .expiration(expireDate)
                .signWith(key())
                .compact();
    }


    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
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


    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith((SecretKey) key())
                    .build()
                    .parse(token);
            return true;
        } catch (MalformedJwtException malformedJwtException) {
            logger.error("Invalid JWT token: {}", malformedJwtException.getMessage());
        } catch (ExpiredJwtException expiredJwtException) {
            logger.error("Expired JWT token: {}", expiredJwtException.getMessage());
        } catch (UnsupportedJwtException unsupportedJwtException) {
            logger.error("Unsupported JWT token: {}", unsupportedJwtException.getMessage());
        } catch (IllegalArgumentException illegalArgumentException) {
            logger.error("JWT claims string is empty: {}", illegalArgumentException.getMessage());
        }
        return false;
    }

    public long getJwtRefreshExpirationDate() {
        return jwtRefreshExpirationDate;
    }

    public Date getExpirationDateFromToken(String token) {
        return getAllClaims(token).getExpiration();
    }
}