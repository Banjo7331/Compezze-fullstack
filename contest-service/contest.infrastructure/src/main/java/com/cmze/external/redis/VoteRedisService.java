package com.cmze.external.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteRedisService {

    private final StringRedisTemplate redisTemplate;

    @Value("${voting.redis.score-key-pattern}")
    private String scoreKeyPattern;

    @Value("${voting.redis.count-key-pattern}")
    private String countKeyPattern;

    @Value("${voting.redis.user-history-key-pattern}")
    private String userHistoryKeyPattern;

    @Value("${voting.redis.detail-key-pattern}")
    private String detailKeyPattern;

    public boolean hasAlreadyVoted(Long stageId, String submissionId, String userId) {
        String key = String.format(userHistoryKeyPattern, stageId, userId);
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(key, submissionId));
    }

    public Double registerVote(Long stageId, String submissionId, String userId, int points) {
        String userHistoryKey = String.format(userHistoryKeyPattern, stageId, userId);
        redisTemplate.opsForSet().add(userHistoryKey, submissionId);

        String countKey = String.format(countKeyPattern, stageId);
        redisTemplate.opsForHash().increment(countKey, submissionId, 1);

        String detailKey = String.format(detailKeyPattern, stageId, submissionId);
        redisTemplate.opsForHash().put(detailKey, userId, String.valueOf(points));

        String scoreKey = String.format(scoreKeyPattern, stageId);
        return redisTemplate.opsForZSet().incrementScore(scoreKey, submissionId, (double) points);
    }

    public Map<String, Double> getAllScores(Long stageId) {
        String scoreKey = String.format(scoreKeyPattern, stageId);

        Set<ZSetOperations.TypedTuple<String>> results = redisTemplate.opsForZSet().rangeWithScores(scoreKey, 0, -1);

        if (results == null || results.isEmpty()) {
            return Collections.emptyMap();
        }

        return results.stream()
                .collect(Collectors.toMap(
                        ZSetOperations.TypedTuple::getValue,
                        tuple -> tuple.getScore() != null ? tuple.getScore() : 0.0
                ));
    }

    public Map<String, Integer> getVoteDetails(Long stageId, String submissionId) {
        String detailKey = String.format(detailKeyPattern, stageId, submissionId);
        Map<Object, Object> rawEntries = redisTemplate.opsForHash().entries(detailKey);

        return rawEntries.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> (String) e.getKey(),
                        e -> Integer.parseInt((String) e.getValue())
                ));
    }
}
