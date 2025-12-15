package com.cmze.specification;

import com.cmze.entity.QuizRoom;
import com.cmze.enums.QuizRoomStatus;
import org.springframework.data.jpa.domain.Specification;

public final class QuizRoomSpecification {

    private QuizRoomSpecification() {}

    public static Specification<QuizRoom> publicAndActive() {
        return Specification.where(isNotPrivate())
                .and(isNotFinished());
    }

    private static Specification<QuizRoom> isNotPrivate() {
        return (root, query, cb) -> cb.equal(root.get("isPrivate"), false);
    }

    private static Specification<QuizRoom> isNotFinished() {
        return (root, query, cb) -> cb.notEqual(root.get("status"), QuizRoomStatus.FINISHED);
    }
}
