package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.response.ProgrammeListResponse;
import com.ngo.finance.donor.service.ProgrammeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/programmes")
@RequiredArgsConstructor
public class ProgrammeController {

    private final ProgrammeService programmeService;


    @GetMapping
    public ResponseEntity<List<ProgrammeListResponse>> getAllProgrammes() {
        return ResponseEntity.ok(programmeService.getAllProgrammes());
    }
}
