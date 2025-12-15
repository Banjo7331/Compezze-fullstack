package com.cmze.specification;

import com.cmze.entity.SurveyRoom;
import org.springframework.data.jpa.domain.Specification;

public final class SurveyRoomSpecification{

    private SurveyRoomSpecification() {}

    public static Specification<SurveyRoom> active() {
        return Specification.where(isOpen());
    }

    private static Specification<SurveyRoom> isOpen() {
        return (root, query, cb) -> cb.equal(root.get("isOpen"), true);
    }
}
