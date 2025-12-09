package com.cmze.configuration;

import com.cmze.security.auth.JwtTokenReader;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.stream.Collectors;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenReader jwtTokenReader;

    public WebSocketConfig(@Lazy final JwtTokenReader jwtTokenReader) {
        this.jwtTokenReader = jwtTokenReader;
    }

    @Override
    public void configureMessageBroker(final MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(final StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(final ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(final Message<?> message, final MessageChannel channel) {
                final var accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

                    final var authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                        final var token = authHeader.substring(7);

                        if (jwtTokenReader.validateToken(token)) {
                            final var userId = jwtTokenReader.getUserId(token);
                            final var roles = jwtTokenReader.getRoles(token);

                            final var authorities = roles.stream()
                                    .map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toList());

                            final var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);

                            accessor.setUser(authentication);
                        } else {
                            throw new AccessDeniedException("Invalid JWT Token");
                        }
                    } else {
                        throw new AccessDeniedException("Missing Authorization Header");
                    }
                }
                return message;
            }
        });
    }
}
