package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.CreateTrancheRequest;
import com.ngo.finance.donor.dto.request.ReceiveTrancheRequest;
import com.ngo.finance.donor.dto.response.TrancheResponse;
import java.util.List;

/**
 * Service for Grant Tranche operations (list / schedule / record receipt).
 */
public interface TrancheService {

    List<TrancheResponse> getTranchesByGrant(Long grantId);

    /** All tranches across every grant, oldest planned release first — feeds the Inflow Budget schedule. */
    List<TrancheResponse> getAllTranches();

    TrancheResponse getTrancheById(Long trancheId);

    TrancheResponse scheduleTranche(Long grantId, CreateTrancheRequest request);

    TrancheResponse receiveTranche(Long trancheId, ReceiveTrancheRequest request);
}
