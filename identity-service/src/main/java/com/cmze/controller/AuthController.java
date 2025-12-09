package com.cmze.controller;

import com.cmze.dto.request.ChangePasswordRequest;
import com.cmze.dto.request.LoginRequest;
import com.cmze.dto.request.RefreshRequest;
import com.cmze.dto.request.RegisterRequest;
import com.cmze.dto.response.auth.JwtAuthResponse;
import com.cmze.service.AuthService;
import com.cmze.util.RefreshTokenUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenUtil refreshTokenUtil;

    public AuthController(AuthService authService, RefreshTokenUtil refreshTokenUtil) {
        this.authService = authService;
        this.refreshTokenUtil = refreshTokenUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse jwtAuthResponse = authService.login(loginRequest);

        ResponseCookie cookie = refreshTokenUtil.createRefreshTokenCookie(jwtAuthResponse.getRefreshToken());

        jwtAuthResponse.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(jwtAuthResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest registerRequest) {
        String response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtAuthResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        RefreshRequest refreshRequest = new RefreshRequest();
        refreshRequest.setRefreshToken(refreshToken);

        JwtAuthResponse jwtAuthResponse = authService.refresh(refreshRequest);

        ResponseCookie cookie = refreshTokenUtil.createRefreshTokenCookie(jwtAuthResponse.getRefreshToken());

        jwtAuthResponse.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(jwtAuthResponse);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> logout(Authentication authentication) {
        authService.logout(authentication);
        ResponseCookie cookie = refreshTokenUtil.createEmptyCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("User logged out successfully!");
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                 Authentication authentication) {
        authService.changePassword(request, authentication);

        return ResponseEntity.ok("Password changed successfully. Please log in again.");
    }
}
