package com.cmze.usecase.form;

import com.cmze.entity.Question;
import com.cmze.entity.QuizForm;
import com.cmze.entity.QuizQuestionOption;
import com.cmze.enums.QuestionType;
import com.cmze.repository.QuizFormRepository;
import com.cmze.request.CreateQuizFormRequest.CreateQuestionOptionRequest;
import com.cmze.request.CreateQuizFormRequest.CreateQuizFormRequest;
import com.cmze.response.CreateQuizFormResponse;
import com.cmze.shared.ActionResult;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import java.util.ArrayList;
import java.util.UUID;

@UseCase
public class CreateQuizFormUseCase {

    private static final Logger logger = LoggerFactory.getLogger(CreateQuizFormUseCase.class);
    private final QuizFormRepository quizFormRepository;

    public CreateQuizFormUseCase(final QuizFormRepository quizFormRepository) {
        this.quizFormRepository = quizFormRepository;
    }

    @Transactional
    public ActionResult<CreateQuizFormResponse> execute(final CreateQuizFormRequest request, final UUID creatorId) {
        try {
            final var quizForm = new QuizForm();
            quizForm.setTitle(request.getTitle());
            quizForm.setCreatorId(creatorId);
            quizForm.setPrivate(request.isPrivate());

            for (final var qDto : request.getQuestions()) {

                final int optionsCount = qDto.getOptions() != null ? qDto.getOptions().size() : 0;

                if (qDto.getType() == QuestionType.TRUE_FALSE && optionsCount != 2) {
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST,
                            "True/False question '" + qDto.getTitle() + "' must have exactly 2 options (e.g. True and False)."
                    ));
                }
                if (optionsCount < 2) {
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST,
                            "Question '" + qDto.getTitle() + "' must have at least 2 options."
                    ));
                }

                final long correctCount = qDto.getOptions().stream()
                        .filter(CreateQuestionOptionRequest::isCorrect)
                        .count();

                if ((qDto.getType() == QuestionType.SINGLE_CHOICE || qDto.getType() == QuestionType.TRUE_FALSE)
                        && correctCount != 1) {
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST,
                            "Question '" + qDto.getTitle() + "' (" + qDto.getType() + ") must have exactly one correct answer."
                    ));
                }

                if (qDto.getType() == QuestionType.MULTIPLE_CHOICE && correctCount < 1) {
                    return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                            HttpStatus.BAD_REQUEST,
                            "Multiple choice question '" + qDto.getTitle() + "' must have at least one correct answer."
                    ));
                }

                final var question = new Question();
                question.setTitle(qDto.getTitle());
                question.setType(qDto.getType());
                question.setPoints(qDto.getPoints());
                question.setQuizForm(quizForm);

                final var options = new ArrayList<QuizQuestionOption>();
                for (final var oDto : qDto.getOptions()) {
                    final var option = new QuizQuestionOption();
                    option.setText(oDto.getText());
                    option.setCorrect(oDto.isCorrect());
                    option.setQuestion(question);
                    options.add(option);
                }
                question.setOptions(options);

                quizForm.getQuestions().add(question);
            }

            final var savedQuiz = quizFormRepository.save(quizForm);
            logger.info("Quiz created with id {} by user {}", savedQuiz.getId(), creatorId);

            return ActionResult.success(new CreateQuizFormResponse(savedQuiz.getId()));

        } catch (Exception e) {
            logger.error("Failed to create quiz", e);
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error creating quiz"
            ));
        }
    }
}
