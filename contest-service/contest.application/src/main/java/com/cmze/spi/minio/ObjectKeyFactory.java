package com.cmze.spi.minio;

public interface ObjectKeyFactory {

    MediaLocation generateForSubmission(Long contestId, String userId, String originalFilename);

    MediaLocation generateForPreview(Long contestId, String submissionId);

    MediaLocation generateForTemplate(Long contestId, String originalFilename);

    MediaLocation generateForAvatar(String avatarName);

    MediaLocation generateForContestCover(String organizerId, String originalFilename);

    String getPublicBucket();
}
