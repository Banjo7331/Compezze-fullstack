package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmitEntryResponse {
    private String id;
    private String objectKey;
    private String publicUrl;
}
