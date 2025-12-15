package com.cmze.service;

import com.cmze.dto.request.ChangePasswordRequest;
import com.cmze.dto.request.LoginRequest;
import com.cmze.dto.request.RefreshRequest;
import com.cmze.dto.request.RegisterRequest;
import com.cmze.dto.response.auth.JwtAuthResponse;
import com.cmze.entity.Role;
import com.cmze.entity.User;
import com.cmze.entity.enums.RoleType;
import com.cmze.handler.exception.InvalidRequestException;
import com.cmze.handler.exception.ResourceNotFoundException;
import com.cmze.repository.RoleRepository;
import com.cmze.repository.UserRepository;
import com.cmze.security.CustomUserDetails;
import com.cmze.security.JwtTokenProvider;
import com.cmze.util.TokenBlackListUtil;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Date;
import java.util.Set;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlackListUtil tokenBlackListUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       TokenBlackListUtil tokenBlackListUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlackListUtil = tokenBlackListUtil;
    }

    @Transactional
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(Instant.now().plusMillis(jwtTokenProvider.getJwtRefreshExpirationDate()));
        userRepository.save(user);

        return new JwtAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public void logout(String accessToken, Authentication authentication) {
        if (authentication != null) {
            String username = authentication.getName();
            userRepository.findByUsernameOrEmail(username, username)
                    .ifPresent(user -> {
                        user.setRefreshToken(null);
                        user.setRefreshTokenExpiry(null);
                        userRepository.save(user);
                    });
        }

        try {
            Date expirationDate = jwtTokenProvider.getExpirationDateFromToken(accessToken);
            long now = System.currentTimeMillis();
            long timeToLive = expirationDate.getTime() - now;

            if (timeToLive > 0) {
                tokenBlackListUtil.blacklistToken(accessToken, timeToLive);
            }
        } catch (Exception e) {
            System.err.println("Error processing logout token blacklist: " + e.getMessage());
        }
    }

    @Transactional
    public String register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new InvalidRequestException("User with that username already exists");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new InvalidRequestException("Email address already in use");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Server Error: Default role not configured."));

        user.setRoles(Set.of(userRole));

        userRepository.save(user);

        return "User registered successfully!";
    }

    @Transactional
    public JwtAuthResponse refresh(RefreshRequest refreshRequest) {
        String requestRefreshToken = refreshRequest.getRefreshToken();

        if (!jwtTokenProvider.validateToken(requestRefreshToken)) {
            throw new InvalidRequestException("Invalid Refresh Token");
        }

        User user = userRepository.findByRefreshToken(requestRefreshToken)
                .orElseThrow(() -> new InvalidRequestException("Invalid Refresh Token (User not found)"));

        if (user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new InvalidRequestException("Refresh token has expired. Please log in again.");
        }

        UserDetails userDetails = CustomUserDetails.build(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        String newAccessToken = jwtTokenProvider.generateToken(authentication);

        return new JwtAuthResponse(newAccessToken, requestRefreshToken);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidRequestException("Incorrect old password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);

        userRepository.save(user);
    }

    private ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }

    private ResponseCookie createEmptyCookie() {
        return createRefreshTokenCookie("", 0);
    }
}
