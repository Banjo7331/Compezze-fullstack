package com.cmze.usecase.resources.templates;

import com.cmze.response.TemplateResponse;
import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MinioService;
import com.cmze.spi.minio.ObjectKeyFactory;
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
    private final ObjectKeyFactory objectKeyFactory;

    @Value("${app.media.publicBaseUrl:}")
    private String publicBaseUrl;

    private final String TEMPLATE_PREFIX = "templates/";

    public ListTemplatesUseCase(MinioService minioService, ObjectKeyFactory objectKeyFactory) {
        this.minioService = minioService;
        this.objectKeyFactory = objectKeyFactory;
    }

    public ActionResult<List<TemplateResponse>> execute() {

        try {
            String bucket = objectKeyFactory.getPublicBucket();

            List<String> objectKeys = minioService.listObjectKeys(bucket, TEMPLATE_PREFIX);

            List<TemplateResponse> responseList = objectKeys.stream()
                    .map(key -> new TemplateResponse(key, buildPublicUrl(publicBaseUrl, key)))
                    .collect(Collectors.toList());

            return ActionResult.success(responseList);

        } catch (Exception ex) {
            // 5. ZWRÓĆ BŁĄD (jeśli MinIO zawiedzie)
            logger.error("Failed to list templates from MinIO: {}", ex.getMessage(), ex);
            ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not list templates: " + ex.getMessage()
            );
            return ActionResult.failure(pd);
        }
    }

    private static String buildPublicUrl(String baseUrl, String key) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return null;
        }
        String cleanKey = key.startsWith("/") ? key.substring(1) : key;
        String cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;

        return cleanBaseUrl + "/" + cleanKey;
    }
}
