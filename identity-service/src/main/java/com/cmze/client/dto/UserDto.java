package com.cmze.client.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID id;
    private String username;
    private String email;
    private List<String> roles;
}
