package com.cmze.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenUtil {

    @Value("${app.jwt-refresh-expiration-milliseconds}")
    private Long refreshTokenDurationMs;

    public ResponseCookie createRefreshTokenCookie(String token) {
        long maxAgeSeconds = refreshTokenDurationMs / 1000;

        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }

    public ResponseCookie createEmptyCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();
    }
}
