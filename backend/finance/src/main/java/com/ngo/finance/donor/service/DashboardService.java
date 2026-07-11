package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.response.DashboardSummaryResponse;

/**
 * Service for the dashboard summary aggregation.
 */
public interface DashboardService {

    DashboardSummaryResponse getSummary();
}
