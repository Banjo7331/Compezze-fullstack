package com.cmze.request;

import lombok.*;

@Data
@NoArgsConstructor
public class ChatCommand {
    private String content;
    private String senderName;
}
