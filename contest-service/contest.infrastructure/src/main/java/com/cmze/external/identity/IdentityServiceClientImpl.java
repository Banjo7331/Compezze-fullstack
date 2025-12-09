package com.cmze.external.identity;

import com.cmze.spi.identity.IdentityServiceClient;
import com.cmze.spi.identity.UserDto;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IdentityServiceClientImpl implements IdentityServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(IdentityServiceClientImpl.class);
    private final InternalIdentityApi internalApi;

    public IdentityServiceClientImpl(InternalIdentityApi internalApi) {
        this.internalApi = internalApi;
    }

    @Override
    public UserDto getUserByUsername(String username) {
        try {
            return internalApi.fetchUserByUsername(username);
        } catch (FeignException.NotFound e) {
            return null;
        } catch (Exception e) {
            logger.error("Failed to fetch user by username: {}", username, e);
            throw new RuntimeException("Auth service unavailable", e);
        }
    }

    @Override
    public UserDto getUserById(UUID userId) {
        try {
            return internalApi.getUserById(userId);

        } catch (FeignException.NotFound e) {
            logger.warn("User with ID {} not found in Auth Service", userId);
            return null;

        } catch (Exception e) {
            logger.error("Failed to fetch user by ID: {}", userId, e);
            return null;
        }
    }
}
