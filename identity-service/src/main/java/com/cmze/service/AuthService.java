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
import java.util.Set;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found after successful authentication"));

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(Instant.now().plusMillis(jwtTokenProvider.getJwtRefreshExpirationDate()));
        userRepository.save(user);

        return new JwtAuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public void logout(Authentication authentication) {
        User user = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for logout"));

        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        userRepository.save(user);
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
                .orElseThrow(() -> new ResourceNotFoundException("Error: Default 'ROLE_USER' not found in database."));

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found for this token"));

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

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
