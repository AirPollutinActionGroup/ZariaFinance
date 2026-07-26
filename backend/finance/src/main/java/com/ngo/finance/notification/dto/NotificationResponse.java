package com.ngo.finance.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    private Long id;

    private String title;

    private String body;

    private String link;

    private String category;

    /** True when this is the deputy's informational copy. */
    private Boolean escalation;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;
}
