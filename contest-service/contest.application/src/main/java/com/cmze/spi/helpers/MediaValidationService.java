package com.cmze.spi.helpers;

import com.cmze.enums.SubmissionMediaPolicy;
import org.springframework.http.ProblemDetail;
import org.springframework.web.multipart.MultipartFile;

public interface MediaValidationService {
    ProblemDetail validateFileAgainstPolicy(SubmissionMediaPolicy policy, MultipartFile file);
}
