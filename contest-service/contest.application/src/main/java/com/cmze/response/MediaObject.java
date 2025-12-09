package com.cmze.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MediaObject {
    private byte[] data;
    private String contentType;
    private Long   size;
    private String etag;
    private String objectKey;
    private String bucket;
}
