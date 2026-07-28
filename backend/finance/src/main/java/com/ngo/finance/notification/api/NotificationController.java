package com.ngo.finance.notification.api;

import com.ngo.finance.notification.dto.NotificationResponse;
import com.ngo.finance.notification.service.NotificationService;
import com.ngo.finance.notification.service.ReminderSweepService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * In-app notifications.
 *
 * {@code userId} is a query parameter because there is no server-side session
 * identity yet (docs/BACKEND_GAPS.md #1); it becomes the authenticated principal
 * once that lands.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app reminders and escalations")
public class NotificationController {

    private final NotificationService notificationService;
    private final ReminderSweepService reminderSweepService;

    @Autowired
    public NotificationController(NotificationService notificationService,
            ReminderSweepService reminderSweepService) {
        this.notificationService = notificationService;
        this.reminderSweepService = reminderSweepService;
    }

    @GetMapping
    @Operation(summary = "List a user's notifications")
    public ResponseEntity<List<NotificationResponse>> list(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(notificationService.list(userId, unreadOnly, limit));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Count a user's unread notifications")
    public ResponseEntity<Map<String, Long>> unreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("unread", notificationService.unreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark one notification read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all of a user's notifications read")
    public ResponseEntity<Map<String, Integer>> markAllRead(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("updated", notificationService.markAllRead(userId)));
    }

    /**
     * Runs the sweep on demand — for verifying a reminder configuration without
     * waiting for the nightly job. Idempotent, so calling it repeatedly is safe.
     */
    @PostMapping("/sweep")
    @Operation(summary = "Run the reminder sweep now")
    public ResponseEntity<Map<String, Integer>> sweep(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate on = date != null ? date : LocalDate.now();
        log.info("POST /api/v1/notifications/sweep for {}", on);
        return ResponseEntity.ok(Map.of("delivered", reminderSweepService.sweep(on)));
    }
}
