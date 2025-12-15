package com.cmze.specification;

import com.cmze.entity.QuizForm;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class QuizFormSpecification{

    private QuizFormSpecification() {}

    public static Specification<QuizForm> availableForUser(UUID userId) {
        return Specification.where(isNotDeleted())
                .and(isPublicOrOwnedBy(userId));
    }

    private static Specification<QuizForm> isNotDeleted() {
        return (root, query, cb) -> cb.equal(root.get("deleted"), false);
    }

    private static Specification<QuizForm> isPublicOrOwnedBy(UUID userId) {
        return (root, query, cb) -> cb.or(
                cb.equal(root.get("isPrivate"), false),
                cb.equal(root.get("creatorId"), userId)
        );
    }
}
