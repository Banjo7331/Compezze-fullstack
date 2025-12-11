package com.cmze.controller;

import com.cmze.client.dto.UserDto;
import com.cmze.dto.response.user.UserSummaryResponse;
import com.cmze.entity.User;
import com.cmze.repository.UserRepository;
import com.cmze.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getMyData(Authentication authentication) {
        UserDto user = userService.getMyData(authentication);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        UserDto user = userService.getUserByUsername(username);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID userId) {
        UserDto user = userService.getUserById(userId);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<UserSummaryResponse>> searchUsers(
            @RequestParam String query,
            @PageableDefault(size = 5) Pageable pageable
    ) {
        Page<UserSummaryResponse> responsePage = userService.searchUsers(query, pageable);

        return ResponseEntity.ok(responsePage);
    }
}
