package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetSubmissionMediaUrlResponse {
    private String url;          // presigned URL (GET)
    private int expiresInSec;    // TTL w sekundach
    private String contentType;  // np. video/mp4
    private Long size;           // rozmiar bajtów
    private String filename;     // oryginalna nazwa
}
