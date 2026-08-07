package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.CreateProgrammeRequest;
import com.ngo.finance.donor.dto.response.ProgrammeListResponse;
import com.ngo.finance.donor.dto.response.ProgrammeResponse;
import java.util.List;

public interface ProgrammeService {
    List<ProgrammeListResponse> getAllProgrammes();

    ProgrammeResponse getProgrammeById(Long id);

    ProgrammeResponse createProgramme(CreateProgrammeRequest request);

    void activateProgramme(Long id);

    void deactivateProgramme(Long id);
}
