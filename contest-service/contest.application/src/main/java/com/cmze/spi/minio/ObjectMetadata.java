package com.cmze.spi.minio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ObjectMetadata {
    private String contentType;
    private long size;
    private String etag;
    private String versionId;

    public ObjectMetadata(String contentType, long size) {
        this.contentType = contentType;
        this.size = size;
        this.etag = null;
        this.versionId = null;
    }
}
