package com.cmze.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatCommand {
    @NotBlank
    @Size(max = 2000)
    private String text;

    @Size(max = 50)
    private String nickname;
}
