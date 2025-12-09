package com.cmze.usecase.resources.templates;

import com.cmze.shared.ActionResult;
import com.cmze.spi.minio.MediaLocation;
import com.cmze.spi.minio.MinioService;
import com.cmze.spi.minio.ObjectKeyFactory;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

@UseCase
public class UploadTemplateUseCase {

    private static final Logger logger = LoggerFactory.getLogger(UploadTemplateUseCase.class);

    private final MinioService minioService;
    private final ObjectKeyFactory objectKeyFactory;
    private final long maxBytes = 5L * 1024 * 1024;

    public UploadTemplateUseCase(MinioService minioService, ObjectKeyFactory objectKeyFactory) {
        this.minioService = minioService;
        this.objectKeyFactory = objectKeyFactory;
    }

//    @Transactional
//    public ActionResult<MediaLocation> execute(MultipartFile file, String uploaderId) {
//
//        ProblemDetail validationError = validateImage(file);
//        if (validationError != null) {
//            return ActionResult.failure(validationError);
//        }
//
//        String originalFilename = file.getOriginalFilename();
//
//        MediaLocation location = objectKeyFactory.generateForTemplate(uploaderId, originalFilename);
//
//        try {
//            minioService.upload(
//                    location.getBucket(),
//                    location.getObjectKey(),
//                    file.getInputStream(),
//                    file.getSize(),
//                    file.getContentType()
//            );
//        } catch (Exception e) {
//            logger.error("Failed to upload template '{}' by user {}: {}", originalFilename, uploaderId, e.getMessage());
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
//                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload template."));
//        }
//
//        return ActionResult.success(location);
//    }
//
//    private ProblemDetail validateImage(MultipartFile image) {
//        if (image == null || image.isEmpty()) {
//            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "File is required.");
//        }
//
//        String contentType = Objects.toString(image.getContentType(), "");
//        if (!(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
//            return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only JPEG, PNG or WEBP are allowed.");
//        }
//        if (image.getSize() > maxBytes) {
//            return ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be <= 5 MB.");
//        }
//
//        try (InputStream is = image.getInputStream()) {
//            if (ImageIO.read(is) == null) {
//                return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image file content. File is not a valid image.");
//            }
//        } catch (IOException e) {
//            logger.warn("Could not read image input stream for validation", e);
//            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Failed to read image file.");
//        }
//
//        return null;
//    }
}
