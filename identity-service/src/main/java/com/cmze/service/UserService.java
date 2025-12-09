package com.cmze.service;

import com.cmze.client.dto.UserDto;
import com.cmze.dto.response.user.UserSummaryResponse;
import com.cmze.entity.User;
import com.cmze.handler.exception.ResourceNotFoundException;
import com.cmze.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String usernameOrEmail) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with: " + usernameOrEmail));

        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID userId) {
        User user =  userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getMyData(Authentication authentication) {
        User user = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found from authentication context"));

        return mapToDto(user);
    }

    @Transactional
    public Page<UserSummaryResponse> searchUsers(String query, Pageable pageable){
        Page<User> usersPage = userRepository.findByUsernameContainingIgnoreCase(query, pageable);

        Page<UserSummaryResponse> responsePage = usersPage.map(u ->
                new UserSummaryResponse(u.getId(), u.getUsername())
        );

        return responsePage;
    }

    private UserDto mapToDto(User user) {
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}
