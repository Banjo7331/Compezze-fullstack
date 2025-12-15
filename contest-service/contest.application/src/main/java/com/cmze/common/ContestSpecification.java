package com.cmze.common;

import com.cmze.entity.Contest;
import com.cmze.enums.ContestStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class ContestSpecification {

    private ContestSpecification() {}

    public static Specification<Contest> publicAndJoinable() {
        return Specification.where(isNotPrivate())
                .and(areSignupsOpen())
                .and(isNotExpired())
                .and(hasVisibleStatus());
    }

    private static Specification<Contest> isNotPrivate() {
        return (root, query, cb) -> cb.equal(root.get("isPrivate"), false);
    }

    private static Specification<Contest> areSignupsOpen() {
        return (root, query, cb) -> cb.equal(root.get("isOpen"), true);
    }

    private static Specification<Contest> isNotExpired() {
        return (root, query, cb) -> cb.greaterThan(root.get("endDate"), LocalDateTime.now());
    }

    private static Specification<Contest> hasVisibleStatus() {
        return (root, query, cb) -> root.get("status").in(ContestStatus.CREATED, ContestStatus.DRAFT, ContestStatus.ACTIVE);
    }

    private static Specification<Contest> hasAvailableSlots() {
        return (root, query, cb) -> {
            var noLimit = cb.isNull(root.get("participantLimit"));

            var slotsAvailable = cb.lessThan(
                    cb.size(root.get("participants")),
                    root.get("participantLimit")
            );

            return cb.or(noLimit, slotsAvailable);
        };
    }
}
