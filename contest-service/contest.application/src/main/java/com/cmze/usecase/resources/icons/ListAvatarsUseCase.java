package com.cmze.usecase.resources.icons;

import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MinioService;
import com.cmze.usecase.UseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import java.util.List;
import java.util.stream.Collectors;

@UseCase
public class ListAvatarsUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ListAvatarsUseCase.class);

    private final MinioService minioService;

    @Value("${app.media.public.bucket:contest-public}")
    private String publicBucket;

    private static final String AVATAR_PREFIX = "avatars/";

    public ListAvatarsUseCase(final MinioService minioService) {
        this.minioService = minioService;
    }

    public ActionResult<List<String>> execute() {
        try {
            final var objectKeys = minioService.listObjectKeys(publicBucket, AVATAR_PREFIX);

            final var urls = objectKeys.stream()
                    .map(key -> minioService.getPublicUrl(publicBucket, key))
                    .collect(Collectors.toList());

            return ActionResult.success(urls);

        } catch (Exception e) {
            logger.error("Failed to list avatars from bucket {}", publicBucket, e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to list avatars"
            ));
        }
    }
}
