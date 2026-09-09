package com.ngo.finance.programme.service;

import com.ngo.finance.programme.dto.request.CreateProgrammeRequest;
import com.ngo.finance.programme.dto.response.ProgrammeListResponse;
import com.ngo.finance.programme.dto.response.ProgrammeResponse;
import java.util.List;

public interface ProgrammeService {
    List<ProgrammeListResponse> getAllProgrammes();

    ProgrammeResponse getProgrammeById(Long id);

    ProgrammeResponse createProgramme(CreateProgrammeRequest request);

    void activateProgramme(Long id);

    void deactivateProgramme(Long id);

    /** Sets any lifecycle status directly (Planned/Active/On Hold/Complete/Close); isActive stays in sync. */
    ProgrammeResponse updateStatus(Long id, String status);
}
