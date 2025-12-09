package com.cmze.utils;

import com.cmze.enums.SubmissionMediaPolicy;
import com.cmze.spi.helpers.MediaValidationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Service
public class MediaValidationServiceImpl implements MediaValidationService {

    @Value("${app.media.max-image-size:10MB}")
    private DataSize maxImageSize;

    @Value("${app.media.max-video-size:100MB}")
    private DataSize maxVideoSize;

    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> VIDEO_TYPES = Set.of("video/mp4", "video/mpeg", "video/quicktime");

    @Override
    public ProblemDetail validateFileAgainstPolicy(SubmissionMediaPolicy policy, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "File is required.");
        }

        String contentType = file.getContentType();
        if (contentType == null) contentType = "";
        contentType = contentType.toLowerCase();

        String ext = extOf(file.getOriginalFilename());
        long size = file.getSize();

        boolean isImage = IMAGE_TYPES.contains(contentType) || extIn(ext, ".jpg", ".jpeg", ".png", ".webp");
        boolean isVideo = VIDEO_TYPES.contains(contentType) || extIn(ext, ".mp4", ".mov", ".m4v");

        if (policy == SubmissionMediaPolicy.IMAGES_ONLY && !isImage) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "This contest accepts images only (JPG, PNG, WEBP).");
        }
        if (policy == SubmissionMediaPolicy.VIDEOS_ONLY && !isVideo) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "This contest accepts videos only (MP4, MOV).");
        }
        if (policy == SubmissionMediaPolicy.BOTH && !(isImage || isVideo)) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Only images (JPG, PNG, WEBP) or videos (MP4, MOV) are allowed.");
        }
        if (policy == SubmissionMediaPolicy.NONE) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Submissions are disabled.");
        }

        if (isImage && !extIn(ext, ".jpg", ".jpeg", ".png", ".webp")) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Allowed image formats: JPG, PNG, WEBP.");
        }
        if (isVideo && !extIn(ext, ".mp4", ".mov", ".m4v")) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Allowed video formats: MP4, MOV.");
        }

        if (isImage && size > maxImageSize.toBytes()) {
            return ProblemDetail.forStatusAndDetail(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Image too large. Max " + maxImageSize.toMegabytes() + " MB.");
        }
        if (isVideo && size > maxVideoSize.toBytes()) {
            return ProblemDetail.forStatusAndDetail(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Video too large. Max " + maxVideoSize.toMegabytes() + " MB.");
        }

        return null;
    }

    private String extOf(String filename) {
        if (filename == null) return "";
        int i = filename.lastIndexOf('.');
        return (i >= 0) ? filename.substring(i).toLowerCase() : "";
    }

    private boolean extIn(String ext, String... allowed) {
        for (String a : allowed) if (ext.equals(a)) return true;
        return false;
    }
}
