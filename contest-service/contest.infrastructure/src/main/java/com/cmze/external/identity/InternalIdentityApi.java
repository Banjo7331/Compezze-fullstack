package com.cmze.external.identity;

import com.cmze.configuration.FeignConfig;
import com.cmze.spi.identity.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(
        name = "auth-service",
        path = "/users",
        configuration = FeignConfig.class
)
public interface InternalIdentityApi {
    @GetMapping("/{usernameOrEmail}")
    UserDto fetchUserByUsername(@PathVariable("usernameOrEmail") String username);
    @GetMapping("/{userId}")
    UserDto getUserById(@PathVariable("userId") UUID userId);
}
