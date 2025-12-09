package com.cmze.external.minio;

import com.cmze.spi.minio.MinioService;
import com.cmze.spi.minio.ObjectMetadata;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.http.Method;
import io.minio.messages.Item;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class MinioServiceImpl implements MinioService { // Implements the correct interface

    private static final Logger logger = LoggerFactory.getLogger(MinioServiceImpl.class);

    private final MinioClient client;

    @Value("${app.media.presigned-get-ttl:10m}")
    private Duration presignedGetTtl;

    public MinioServiceImpl(MinioClient client) {
        this.client = client;
    }

    @Override
    public ObjectMetadata upload(String bucket, String objectKey, InputStream in, long size, String contentType) {
        ensureBucketExists(bucket);

        try {
            ObjectWriteResponse resp = putObject(bucket, objectKey, in, size, contentType);
            return new ObjectMetadata(contentType, size, resp.etag(), resp.versionId());
        } catch (Exception e) {
            logger.error("Error writing to MinIO: {}/{}", bucket, objectKey, e);
            throw new RuntimeException("File save failed for: " + bucket + "/" + objectKey, e);
        }
    }

    @Override
    public ObjectMetadata copyAndGetMetadata(String sourceBucket, String sourceKey,
                                             String destBucket, String destKey) {
        ensureBucketExists(destBucket);
        try {
            client.copyObject(
                    CopyObjectArgs.builder()
                            .source(CopySource.builder().bucket(sourceBucket).object(sourceKey).build())
                            .bucket(destBucket)
                            .object(destKey)
                            .build()
            );

            StatObjectResponse stats = client.statObject(
                    StatObjectArgs.builder().bucket(destBucket).object(destKey).build()
            );

            return new ObjectMetadata(stats.contentType(), stats.size());

        } catch (Exception e) {
            logger.error("Error copying in MinIO: {} -> {}", sourceKey, destKey, e);
            throw new RuntimeException("Object copying failed for: " + sourceKey + " to " + destKey, e);
        }
    }

    @Override
    public void delete(String bucket, String objectKey) {
        try {
            client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectKey).build());
        } catch (Exception e) {
            logger.error("Error deleting from MinIO: {}/{}", bucket, objectKey, e);
            throw new RuntimeException("Deletion failed for: " + bucket + "/" + objectKey, e);
        }
    }

    // Renamed from 'get' to 'downloadFile'
    @Override
    public GetObjectResponse downloadFile(String bucket, String objectKey) {
        try {
            return client.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(objectKey).build()
            );
        } catch (Exception e) {
            logger.error("Error downloading file from MinIO: {}/{}", bucket, objectKey, e);
            throw new RuntimeException("Download failed for: " + bucket + "/" + objectKey, e);
        }
    }

    @Override
    public URL getPresignedUrlForDisplay(String bucket, String objectKey, Duration expiry) {
        int seconds = toSecondsBounded(expiry != null ? expiry : presignedGetTtl);
        try {
            String url = client.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectKey)
                    .expiry(seconds)
                    .build());
            return new URL(url);
        } catch (Exception e) {
            logger.error("Error generating presigned-URL for MinIO: {}/{}", bucket, objectKey, e);
            throw new RuntimeException("Presign GET failed for: " + bucket + "/" + objectKey, e);
        }
    }

    @Override
    public List<String> listObjectKeys(String bucket, String prefix) {
        try {
            Iterable<Result<Item>> results = client.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucket)
                            .prefix(prefix) // e.g., "templates/"
                            .recursive(true) // Search subfolders as well
                            .build()
            );

            return StreamSupport.stream(results.spliterator(), false)
                    .map(itemResult -> {
                        try {
                            return itemResult.get().objectName();
                        } catch (Exception e) {
                            logger.error("Error fetching item from MinIO result", e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error listing objects in MinIO: bucket={}, prefix={}", bucket, prefix, e);
            throw new RuntimeException("File listing failed for: " + bucket + "/" + prefix, e);
        }
    }

    @Override
    public List<String> listFiles(String bucket, String prefix) {
        try {
            Iterable<Result<Item>> results = client.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucket)
                            .prefix(prefix)
                            .recursive(false)
                            .build()
            );

            List<String> fileNames = new ArrayList<>();
            for (Result<Item> result : results) {
                String objectName = result.get().objectName();

                String fileName = objectName.replace(prefix, "");
                if (!fileName.isBlank()) {
                    fileNames.add(fileName);
                }
            }
            return fileNames;
        } catch (Exception e) {
            logger.error("Error listing files in MinIO", e);
            return Collections.emptyList();
        }
    }

    private ObjectWriteResponse putObject(String bucket,
                                          String objectKey,
                                          InputStream in,
                                          long size,
                                          String contentType) {
        try {
            PutObjectArgs.Builder b = PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .stream(in, size, -1)
                    .contentType(contentType);
            return client.putObject(b.build());
        } catch (ErrorResponseException e) {
            throw new RuntimeException("MinIO error: " + e.errorResponse().message(), e);
        } catch (Exception e) {
            throw new RuntimeException("Write failed for: " + bucket + "/" + objectKey, e);
        }
    }

    private void ensureBucketExists(String bucket) {
        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                logger.warn("Automatically creating bucket: {}. This should be done by an init script!", bucket);
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not create/check bucket: " + bucket, e);
        }
    }

    private static int toSecondsBounded(Duration d) {
        long s = (d != null ? d.getSeconds() : 600);
        if (s < 1) s = 1;
        long max = 7L * 24 * 3600; // 7 days
        if (s > max) s = max;
        return (int) s;
    }
}
