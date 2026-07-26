package com.ngo.finance.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables Spring's scheduler, used by the daily reminder sweep.
 *
 * Single-instance assumption: with more than one app instance every instance
 * would run the sweep. That is safe today only because the sweep deduplicates on
 * a unique key — introduce a lock (e.g. ShedLock) before relying on scheduled
 * work that is not idempotent.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
