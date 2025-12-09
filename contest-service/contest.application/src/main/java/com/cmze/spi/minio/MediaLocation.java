package com.cmze.spi.minio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MediaLocation {
    private String bucket; // np. contest-private / contest-public
    private String objectKey;    // np. contests/..../submissions/.../UUID.mp4
}
