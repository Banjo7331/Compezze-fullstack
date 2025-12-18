package com.cmze.usecase.resources.templates;

import com.cmze.response.TemplateResponse;
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
public class ListTemplatesUseCase {

    private static final Logger logger = LoggerFactory.getLogger(ListTemplatesUseCase.class);

    private final MinioService minioService;

    @Value("${app.media.public.bucket:contest-public}")
    private String publicBucket;

    private static final String TEMPLATE_PREFIX = "templates/";

    public ListTemplatesUseCase(final MinioService minioService) {
        this.minioService = minioService;
    }

    public ActionResult<List<TemplateResponse>> execute() {
        try {
            final var objectKeys = minioService.listObjectKeys(publicBucket, TEMPLATE_PREFIX);

            final var responseList = objectKeys.stream()
                    .map(key -> {
                        String displayName = key.replace(TEMPLATE_PREFIX, "");
                        String url = minioService.getPublicUrl(publicBucket, key);
                        
                        return new TemplateResponse(displayName, url);
                    })
                    .collect(Collectors.toList());

            return ActionResult.success(responseList);

        } catch (Exception e) {
            logger.error("Failed to list templates from bucket {}", publicBucket, e);
            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Could not list templates"
            ));
        }
    }
}