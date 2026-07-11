package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.response.FcraRegisterEntry;
import com.ngo.finance.donor.dto.response.UtilisationComplianceEntry;
import java.util.List;

/**
 * Read-only reporting aggregations over the donor module.
 */
public interface ReportsService {

    List<FcraRegisterEntry> getFcraRegister();

    List<UtilisationComplianceEntry> getUtilisationCompliance();
}
