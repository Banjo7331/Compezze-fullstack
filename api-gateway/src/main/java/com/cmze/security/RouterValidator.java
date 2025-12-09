package com.cmze.security;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouterValidator {

    public static final List<String> publicApiEndpoints = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> publicApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().startsWith(uri));
}
