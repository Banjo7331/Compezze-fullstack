package com.cmze.security;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RouterValidator routerValidator;
    private final JwtValidator jwtValidator;

    public AuthenticationFilter(RouterValidator routerValidator, JwtValidator jwtValidator) {
        super(Config.class);
        this.routerValidator = routerValidator;
        this.jwtValidator = jwtValidator;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (routerValidator.isSecured.test(exchange.getRequest())) {

                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return this.onError(exchange, "Authorization header is missing", HttpStatus.UNAUTHORIZED);
                }
                String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return this.onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
                }
                String token = authHeader.substring(7);

                try {
                    if (!jwtValidator.validateToken(token)) {
                        return this.onError(exchange, "Token is invalid or expired", HttpStatus.UNAUTHORIZED);
                    }

                } catch (Exception e) {
                    return this.onError(exchange, "Token validation error", HttpStatus.UNAUTHORIZED);
                }
            }

            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    public static class Config {
    }
}