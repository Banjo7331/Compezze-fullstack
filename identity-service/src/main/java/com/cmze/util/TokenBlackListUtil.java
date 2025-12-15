package com.cmze.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class TokenBlackListUtil {

    private final StringRedisTemplate stringRedisTemplate;

    @Value("${app.jwt.redis-blacklist-prefix:blacklist:jwt:}")
    private String blacklistPrefix;

    public TokenBlackListUtil(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public void blacklistToken(String token, long timeToLiveInMillis) {
        String key = blacklistPrefix + token;

        stringRedisTemplate.opsForValue().set(key, "true", Duration.ofMillis(timeToLiveInMillis));
    }

    public boolean isTokenBlacklisted(String token) {
        String key = blacklistPrefix + token;

        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
    }
}
