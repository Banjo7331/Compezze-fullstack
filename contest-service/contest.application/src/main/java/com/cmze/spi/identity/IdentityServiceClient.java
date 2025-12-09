package com.cmze.spi.identity;

import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

public interface IdentityServiceClient {
    UserDto getUserByUsername(String username);
    UserDto getUserById(@PathVariable("userId") UUID userId);
}
