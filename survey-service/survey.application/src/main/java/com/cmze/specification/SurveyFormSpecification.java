package com.cmze.specification;

import com.cmze.entity.SurveyForm;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class SurveyFormSpecification {

    private SurveyFormSpecification() {}

    public static Specification<SurveyForm> availableForUser(UUID userId) {
        return Specification.where(isNotDeleted())
                .and(isPublicOrOwnedBy(userId));
    }

    private static Specification<SurveyForm> isNotDeleted() {
        return (root, query, cb) -> cb.equal(root.get("deleted"), false);
    }

    private static Specification<SurveyForm> isPublicOrOwnedBy(UUID userId) {
        return (root, query, cb) -> cb.or(
                cb.equal(root.get("isPrivate"), false),
                cb.and(
                        cb.equal(root.get("isPrivate"), true),
                        cb.equal(root.get("creatorId"), userId)
                )
        );
    }
}
