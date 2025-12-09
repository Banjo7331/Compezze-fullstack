package com.cmze.usecase.contest;

import com.cmze.spi.minio.MinioService;
import com.cmze.usecase.UseCase;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;

@UseCase
public class ListBackgroundTemplatesUseCase {

//    private final MinioService minio;
//
//    @Value("${app.media.public.bucket}")
//    private String publicBucket;
//
//    @Value("${app.media.publicBaseUrl}")
//    private String publicBaseUrl;
//
//    public ListBackgroundTemplatesUseCase(MinioService minio) { this.minio = minio; }
//
//    @Transactional
//    public ActionResult<List<PublicAssetResponse>> execute(String category) {
//        // Prefiks: globalnie albo per kategoria
//        String prefix = (category == null || category.isBlank())
//                ? "templates/global/"
//                : "templates/global/" + safe(category) + "/";
//
//        List<MinioService.ListedObject> items = minio.list(publicBucket, prefix, true);
//
//        List<PublicAssetResponse> out = new ArrayList<>();
//        for (MinioService.ListedObject o : items) {
//            if (o.isDirectory()) continue;
//            String key = o.getKey();
//            out.add(new PublicAssetResponse(
//                    key,
//                    toUrl(publicBaseUrl, key),
//                    filenameOf(key),
//                    o.getSize()
//            ));
//        }
//        return ActionResult.success(out);
//    }
//
//    private static String safe(String v) { return v.replaceAll("[^a-zA-Z0-9_-]", "_"); }
//    private static String filenameOf(String key) {
//        int i = key != null ? key.lastIndexOf('/') : -1;
//        return i >= 0 ? key.substring(i + 1) : (key != null ? key : "");
//    }
//    private static String toUrl(String base, String key) {
//        return base.endsWith("/") ? base + key : base + "/" + key;
//    }
}
