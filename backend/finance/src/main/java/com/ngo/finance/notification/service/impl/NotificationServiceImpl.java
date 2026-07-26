package com.ngo.finance.notification.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.notification.dto.NotificationResponse;
import com.ngo.finance.notification.entity.Notification;
import com.ngo.finance.notification.repository.NotificationRepository;
import com.ngo.finance.notification.service.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId, boolean unreadOnly, int limit) {
        Limit cap = Limit.of(Math.max(1, Math.min(limit, 200)));
        List<Notification> rows = unreadOnly
                ? notificationRepository.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId, cap)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, cap);
        return rows.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Override
    public void markRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    public int markAllRead(Long userId) {
        return notificationRepository.markAllRead(userId);
    }

    /**
     * Each delivery commits on its own so a later failure cannot undo notifications
     * already sent, and the insert is an atomic upsert — see
     * {@link NotificationRepository#insertIfAbsent}.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean deliver(Long userId, String title, String body, String link,
            String category, boolean escalation, String dedupeKey) {
        if (userId == null) {
            log.debug("No recipient for notification '{}' — skipped", title);
            return false;
        }
        int inserted = notificationRepository.insertIfAbsent(
                userId, title, body, link, category, escalation, dedupeKey);
        if (inserted == 0) {
            log.debug("Notification {} already delivered", dedupeKey);
        }
        return inserted > 0;
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .body(n.getBody())
                .link(n.getLink())
                .category(n.getCategory())
                .escalation(n.getEscalation())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
