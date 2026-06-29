package com.ngo.finance.common.event;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Base class for domain events
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class DomainEvent {
    private String eventId;
    private LocalDateTime eventTimestamp;
    private String sourceAggregate;
    private Long aggregateId;

    protected DomainEvent(String sourceAggregate, Long aggregateId) {
        this.eventId = UUID.randomUUID().toString();
        this.eventTimestamp = LocalDateTime.now();
        this.sourceAggregate = sourceAggregate;
        this.aggregateId = aggregateId;
    }
}
