package com.cmze.external.survey;

import com.cmze.configuration.FeignConfig;
import com.cmze.spi.survey.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "survey-service",
        path = "/survey/room",
        configuration = FeignConfig.class
)
public interface InternalSurveyApi {

    @PostMapping
    CreateSurveyRoomResponse createRoom(@RequestBody CreateSurveyRoomRequest request);

    @PostMapping("/{roomId}/generate-token")
    GenerateSurveyTokenResponse generateToken(
            @PathVariable("roomId") String roomId,
            @RequestBody GenerateSurveyTokenRequest request
    );

    @GetMapping("/{roomId}")
    GetSurveyRoomDetailsResponse getRoomDetails(@PathVariable("roomId") String roomId);

    @PostMapping("/{roomId}/close")
    void closeRoom(@PathVariable("roomId") String roomId);
}
