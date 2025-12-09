package com.cmze.usecase.resources.icons;

import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MinioService;
import com.cmze.spi.minio.ObjectKeyFactory;
import com.cmze.usecase.UseCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import java.util.List;
import java.util.stream.Collectors;

@UseCase
public class ListAvatarsUseCase {
    private final MinioService minioService;
    private final ObjectKeyFactory objectKeyFactory;

    @Value("${app.media.publicBaseUrl:http://localhost:9000}")
    private String publicBaseUrl;

    public ListAvatarsUseCase(MinioService minioService, ObjectKeyFactory objectKeyFactory) {
        this.minioService = minioService;
        this.objectKeyFactory = objectKeyFactory;
    }

    public ActionResult<List<String>> execute() {
        try {
            String bucket = objectKeyFactory.getPublicBucket();

            List<String> fileNames = minioService.listFiles(bucket, "avatars/");

            List<String> urls = fileNames.stream()
                    .map(fileName -> {
                        String cleanBase = publicBaseUrl.endsWith("/") ?
                                publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
                        return cleanBase + "/" + bucket + "/avatars/" + fileName;
                    })
                    .collect(Collectors.toList());

            return ActionResult.success(urls);
        } catch (Exception e) {
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to list avatars"));
        }
    }
}
