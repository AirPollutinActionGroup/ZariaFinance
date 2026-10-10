package com.ngo.finance.inflowbudget.service;

import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import java.util.List;

public interface InflowBudgetService {

    List<InflowBudgetLineResponse> getAllLines();

    InflowBudgetLineResponse getLineById(Long id);
}
