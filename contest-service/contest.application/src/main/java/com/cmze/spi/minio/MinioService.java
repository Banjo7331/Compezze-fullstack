package com.cmze.spi.minio;

import io.minio.GetObjectResponse;

import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.List;

public interface MinioService {

    ObjectMetadata upload(String bucket, String objectKey, InputStream in, long size, String contentType);

    ObjectMetadata copyAndGetMetadata(String sourceBucket, String sourceKey,
                                      String destBucket, String destKey);

    void delete(String bucket, String objectKey);

    GetObjectResponse downloadFile(String bucket, String objectKey);

    String getPublicUrl(String bucket, String objectKey);

    URL getPresignedUrlForDisplay(String bucket, String objectKey, Duration expiry);

    List<String> listObjectKeys(String bucket, String prefix);

    List<String> listFiles(String bucket, String prefix);
}


