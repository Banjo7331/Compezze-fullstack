package com.cmze.usecase.room;

import com.cmze.repository.SurveyRoomRepository;
import com.cmze.request.GenerateSessionTokenRequest;
import com.cmze.response.GenerateSessionTokenResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.helpers.invites.SoulboundTokenService;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.UUID;

@UseCase
public class GenerateTokenForUserUseCase {

    private static final Logger logger = LoggerFactory.getLogger(GenerateTokenForUserUseCase.class);

    private final SurveyRoomRepository surveyRoomRepository;
    private final SoulboundTokenService soulboundTokenService;

    public GenerateTokenForUserUseCase(final SurveyRoomRepository surveyRoomRepository,
                                       final SoulboundTokenService soulboundTokenService) {
        this.surveyRoomRepository  = surveyRoomRepository;
        this.soulboundTokenService = soulboundTokenService;
    }

    @Transactional(readOnly = true)
    public ActionResult<GenerateSessionTokenResponse> execute(final UUID roomId, final GenerateSessionTokenRequest request) {
        try {
            final var roomOpt = surveyRoomRepository.findById(roomId);

            if (roomOpt.isEmpty()) {
                logger.warn("Token generation failed: Survey Room {} not found", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.NOT_FOUND, "Survey Room not found"
                ));
            }

            final var room = roomOpt.get();

            if (!room.isOpen() ) {
                logger.warn("Token generation failed: Survey Room {} is finished", roomId);
                return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, "Cannot generate token for a finished survey"
                ));
            }

            final var token = soulboundTokenService.mintInvitationToken(roomId, request.getUserId());

            logger.info("Generated system token for user {} to survey room {}", request.getUserId(), roomId);

            return ActionResult.success(new GenerateSessionTokenResponse(token));

        } catch (Exception e) {
            logger.error("Failed to generate system token for room {}", roomId, e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error generating token"
            ));
        }
    }
}
