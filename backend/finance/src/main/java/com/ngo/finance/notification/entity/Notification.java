package com.ngo.finance.notification.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * An in-app message for one user. Written by the reminder sweep, read by the
 * notification list — no email or push in this design.
 */
@Entity
@Table(name = "notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Notification extends AuditEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    /** In-app route to open, e.g. {@code /grants/12/disbursement}. */
    @Column(length = 500)
    private String link;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String category = "REMINDER";

    /** True for the deputy's copy — informational, never an authority transfer. */
    @Column(nullable = false)
    @Builder.Default
    private Boolean escalation = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    /**
     * Idempotency key for the sweep: one notification per criterion, due date and
     * recipient, so a re-run or a second instance cannot double-send.
     */
    @Column(name = "dedupe_key", nullable = false, unique = true, length = 255)
    private String dedupeKey;
}
