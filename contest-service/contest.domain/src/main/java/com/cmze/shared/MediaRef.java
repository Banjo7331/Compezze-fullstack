package com.cmze.shared;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MediaRef {

    /** Np. contest-private / contest-public */
    private String bucket;

    /** Pełny object key w buckecie */
    private String objectKey;

    /** Content-Type (np. video/mp4) */
    private String contentType;

    /** Rozmiar w bajtach */
    private long bytes;

    /** ETag zwracany przez MinIO/S3 */
    private String etag;

    /** Version ID (jeśli wersjonowanie jest włączone; w przeciwnym razie null) */
    private String versionId;

}
