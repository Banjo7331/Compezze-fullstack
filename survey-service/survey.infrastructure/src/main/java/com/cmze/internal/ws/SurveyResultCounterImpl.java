package com.cmze.internal.ws;

import com.cmze.entity.*;
import com.cmze.enums.QuestionType;
import com.cmze.repository.SurveyEntrantRepository;
import com.cmze.repository.SurveyRoomRepository;
import com.cmze.spi.helpers.room.FinalRoomResultDto;
import com.cmze.spi.helpers.room.QuestionResultDto;
import com.cmze.spi.helpers.room.SurveyResultCounter;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SurveyResultCounterImpl implements SurveyResultCounter {

    private final SurveyRoomRepository surveyRoomRepository;
    private final SurveyEntrantRepository surveyEntrantRepository;

    public SurveyResultCounterImpl(final SurveyRoomRepository surveyRoomRepository,
                                   final SurveyEntrantRepository surveyEntrantRepository) {
        this.surveyRoomRepository = surveyRoomRepository;
        this.surveyEntrantRepository = surveyEntrantRepository;
    }

    @Override
    public FinalRoomResultDto calculate(final UUID roomId) {
        final var room = surveyRoomRepository.findByIdWithSurveyAndQuestions(roomId)
                .orElseThrow(() -> new EntityNotFoundException("SurveyRoom not found with id: " + roomId));

        final var participants = surveyEntrantRepository.findAllBySurveyRoomId(roomId);

        final var submissions = participants.stream()
                .map(SurveyEntrant::getSurveyAttempt)
                .filter(Objects::nonNull)
                .toList();


        final Map<Long, List<ParticipantAnswer>> answersByQuestionId = submissions.stream()
                .flatMap(submission -> submission.getParticipantAnswers().stream())
                .collect(Collectors.groupingBy(
                        answer -> answer.getQuestion().getId()
                ));

        final var questionResults = room.getSurvey().getQuestions().stream()
                .map(question -> {
                    final var answers = answersByQuestionId.getOrDefault(question.getId(), List.of());
                    return mapToQuestionResultDto(question, answers);
                })
                .collect(Collectors.toList());

        return new FinalRoomResultDto(
                (long) participants.size(),
                (long) submissions.size(),
                questionResults
        );
    }

    private QuestionResultDto mapToQuestionResultDto(final Question question, final List<ParticipantAnswer> answers) {
        final var dto = new QuestionResultDto();
        dto.setQuestionId(question.getId());
        dto.setTitle(question.getTitle());
        dto.setType(question.getType());

        final var allSelectedValues = answers.stream()
                .flatMap(pa -> pa.getAnswer().stream())
                .toList();

        if (question.getType() == QuestionType.OPEN_TEXT) {
            dto.setOpenAnswers(allSelectedValues);
            dto.setAnswerCounts(new HashMap<>());
        } else {
            final var counts = allSelectedValues.stream()
                    .collect(Collectors.groupingBy(
                            Function.identity(),
                            Collectors.counting()
                    ));

            dto.setAnswerCounts(counts);
            dto.setOpenAnswers(new ArrayList<>());
        }

        return dto;
    }
}
