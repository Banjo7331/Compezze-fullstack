package com.cmze.external.quiz;

import com.cmze.configuration.FeignConfig;
import com.cmze.spi.quiz.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "quiz-service",
        path = "/quiz/room",
        configuration = FeignConfig.class
)
public interface InternalQuizApi {

    @PostMapping
    CreateQuizRoomResponse createRoom(@RequestBody CreateQuizRoomRequest request);

    @PostMapping("/{roomId}/generate-token")
    GenerateQuizTokenResponse generateToken(
            @PathVariable("roomId") String roomId,
            @RequestBody GenerateQuizTokenRequest request
    );

    @GetMapping("/{roomId}")
    GetQuizRoomDetailsResponse getRoomDetails(@PathVariable("roomId") String roomId);

    @PostMapping("/{roomId}/close")
    void closeRoom(@PathVariable("roomId") String roomId);

}
