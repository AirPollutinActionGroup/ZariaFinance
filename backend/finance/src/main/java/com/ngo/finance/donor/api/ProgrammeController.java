package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.CreateProgrammeRequest;
import com.ngo.finance.donor.dto.response.ProgrammeListResponse;
import com.ngo.finance.donor.dto.response.ProgrammeResponse;
import com.ngo.finance.donor.service.ProgrammeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @GetMapping("/{id}")
    public ResponseEntity<ProgrammeResponse> getProgrammeById(@PathVariable Long id) {
        return ResponseEntity.ok(programmeService.getProgrammeById(id));
    }

    @PostMapping
    public ResponseEntity<ProgrammeResponse> createProgramme(@Valid @RequestBody CreateProgrammeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(programmeService.createProgramme(request));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activateProgramme(@PathVariable Long id) {
        programmeService.activateProgramme(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateProgramme(@PathVariable Long id) {
        programmeService.deactivateProgramme(id);
        return ResponseEntity.noContent().build();
    }
}
