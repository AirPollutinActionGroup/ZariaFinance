package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.response.ProgrammeListResponse;
import java.util.List;

public interface ProgrammeService {
    List<ProgrammeListResponse> getAllProgrammes();
}
