package com.cmze.internal.service.invitation;

import com.cmze.entity.Stage;
import com.cmze.enums.StageType;
import com.cmze.internal.service.invitation.strategy.InvitationStrategy;
import com.cmze.internal.service.voting.VotingContextImpl;
import com.cmze.repository.*;
import com.cmze.spi.InvitationContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class InvitationContextImpl implements InvitationContext {

    private static final Logger logger = LoggerFactory.getLogger(VotingContextImpl.class);

    private final Map<StageType, InvitationStrategy> strategies;

    public InvitationContextImpl(List<InvitationStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                        InvitationStrategy::getStageType,
                        Function.identity(),
                        (a, b) -> a,
                        () -> new EnumMap<>(StageType.class)
                ));
    }

    @Override
    public String getInvitationToken(Stage stage, UUID userId) {
        InvitationStrategy strategy = strategies.get(stage.getType());

        if (strategy == null) {
            throw new RuntimeException("No strategy found for " + stage.getType());
        }
        return strategy.getAccessToken(stage, userId);
    }
}
