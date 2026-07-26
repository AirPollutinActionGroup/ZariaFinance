package com.ngo.finance.notification.repository;

import com.ngo.finance.notification.entity.Notification;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Limit limit);

    List<Notification> findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(Long userId, Limit limit);

    long countByUserIdAndReadAtIsNull(Long userId);

    boolean existsByDedupeKey(String dedupeKey);

    /**
     * Insert unless the dedupe key is already present, atomically.
     *
     * ON CONFLICT DO NOTHING rather than catching a constraint violation: catching
     * one still leaves the transaction marked rollback-only, so its commit fails
     * and takes the rest of the sweep with it. This returns 0 for a duplicate and
     * 1 for an insert, with no exception and no race between check and write.
     */
    @Modifying
    @Query(value = """
            INSERT INTO notification
                (user_id, title, body, link, category, escalation, dedupe_key, created_at, updated_at)
            VALUES
                (:userId, :title, :body, :link, :category, :escalation, :dedupeKey,
                 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (dedupe_key) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") Long userId,
            @Param("title") String title,
            @Param("body") String body,
            @Param("link") String link,
            @Param("category") String category,
            @Param("escalation") boolean escalation,
            @Param("dedupeKey") String dedupeKey);

    @Modifying
    @Query("UPDATE Notification n SET n.readAt = CURRENT_TIMESTAMP "
            + "WHERE n.userId = :userId AND n.readAt IS NULL")
    int markAllRead(@Param("userId") Long userId);
}
