package com.cmze.usecase.contest;

import com.cmze.repository.ContestRepository;
import com.cmze.spi.minio.MinioService;
import com.cmze.usecase.UseCase;

@UseCase
public class GetContestMediaUseCase {

//    private final MinioService minio;
//    private final ContestRepository contestRepo; // Używamy do sprawdzenia, czy konkurs istnieje

//    // UWAGA: Usunęliśmy ParticipantRepository, ponieważ nie jest tu potrzebne.
//
//    @Value("${app.media.public.bucket}")
//    private String publicBucket;
//
//    @Value("${app.media.presigned-get-ttl:10m}")
//    private Duration presignedGetTtl;
//
//    public GetContestMediaUseCase(MinioService minio,
//                                  ContestRepository contestRepo) {
//        this.minio = minio;
//        this.contestRepo = contestRepo;
//    }
//
//    @Transactional(readOnly = true)
//    public ActionResult<GetContestMediaResponse> execute(String contestId, String userId, ContestMediaType mediaType) {
//
//        // 1) Walidacja podstawowa: Sprawdź, czy konkurs w ogóle istnieje
//        //    To ważne, aby nie odpytywać MinIO o nieistniejące zasoby.
//        if (!contestRepo.existsById(contestId)) {
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
//                    HttpStatus.NOT_FOUND, "Contest not found."));
//        }
//
//        // 2) Elastyczna autoryzacja w zależności od typu mediów
//        boolean isAuthorized = checkAuthorization(userId, contestId, mediaType);
//        if (!isAuthorized) {
//            return ActionResult.failure(ProblemDetail.forStatusAndDetail(
//                    HttpStatus.FORBIDDEN, "Access denied."));
//        }
//
//        // 3) Budowanie prefiksu i pobieranie danych z MinIO (bez zmian)
//        String prefix = mediaType.getPathPrefix() + "/" + safe(contestId) + "/";
//        List<Item> mediaItems = minio.listObjects(publicBucket, prefix);
//
//        // 4) Mapowanie na DTO z presignowanymi URL-ami (bez zmian)
//        int expiresInSec = (int) presignedGetTtl.getSeconds();
//        List<ContestMediaFileDto> files = mediaItems.stream()
//                .map(item -> {
//                    String objectKey = item.objectName();
//                    URL presignedUrl = minio.presignGet(publicBucket, objectKey, presignedGetTtl);
//                    String filename = getFilenameFromKey(objectKey);
//                    String contentType = "application/octet-stream";
//
//                    return new ContestMediaFileDto(
//                            presignedUrl.toString(),
//                            expiresInSec,
//                            contentType,
//                            item.size(),
//                            filename
//                    );
//                })
//                .collect(Collectors.toList());
//
//        // 5) Zwrócenie pomyślnej odpowiedzi
//        GetContestMediaResponse response = new GetContestMediaResponse(files);
//        return ActionResult.success(response);
//    }
//
//    /**
//     * Centralna metoda do sprawdzania uprawnień w zależności od typu zasobu.
//     */
//    private boolean checkAuthorization(String userId, String contestId, ContestMediaType mediaType) {
//        // Podstawowe założenie: użytkownik musi być zalogowany, aby widzieć cokolwiek.
//        // Jeśli `userId` pochodzi z kontekstu bezpieczeństwa, null oznacza anonimowego usera.
//        if (userId == null || userId.isBlank()) {
//            return false;
//        }
//
//        // Logika specyficzna dla typu mediów
//        switch (mediaType) {
//            case TEMPLATE:
//                // Dostęp do szablonów powinien mieć każdy zalogowany użytkownik,
//                // który tworzy konkurs lub przegląda istniejące.
//                // Nie musi być uczestnikiem.
//                return true; // Wystarczy, że jest zalogowany
//
//            case ICON:
//                // Lista dostępnych ikon konkursu jest informacją publiczną dla zalogowanych użytkowników.
//                // Użytkownik nie musi być jeszcze uczestnikiem, aby je zobaczyć.
//                return true; // Wystarczy, że jest zalogowany
//
//            // W przyszłości można dodać bardziej restrykcyjne typy:
//            // case ADMIN_ASSET:
//            //     // Tutaj moglibyśmy sprawdzić, czy użytkownik ma rolę admina konkursu
//            //     return userIsContestAdmin(userId, contestId);
//
//            default:
//                // Domyślnie blokujemy dostęp dla nieznanych typów
//                return false;
//        }
//    }
//
//    // ========= Metody pomocnicze (bez zmian) =========
//
//    private String safe(String input) {
//        return input.replaceAll("[^a-zA-Z0-B9-_]", "_");
//    }
//
//    private String getFilenameFromKey(String objectKey) {
//        if (objectKey == null || !objectKey.contains("/")) {
//            return objectKey;
//        }
//        return objectKey.substring(objectKey.lastIndexOf('/') + 1);
//    }
} 
