package com.ngo.finance.donor.service.impl;

import com.ngo.finance.donor.dto.response.ProgrammeListResponse;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.service.ProgrammeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProgrammeServiceImpl implements ProgrammeService {

    private final ProgrammeRepository programmeRepository;

    @Override
    public List<ProgrammeListResponse> getAllProgrammes() {
        return programmeRepository.findAll().stream()
                .map(programme -> ProgrammeListResponse.builder()
                        .id(programme.getId())
                        .programmeCode(programme.getProgrammeCode())
                        .programmeName(programme.getProgrammeName())
                        .isActive(programme.getIsActive())
                        .build())
                .toList();
    }
}
