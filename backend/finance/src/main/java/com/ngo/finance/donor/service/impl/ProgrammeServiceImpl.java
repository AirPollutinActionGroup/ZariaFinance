package com.ngo.finance.donor.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.dto.request.CreateProgrammeRequest;
import com.ngo.finance.donor.dto.response.ProgrammeListResponse;
import com.ngo.finance.donor.dto.response.ProgrammeResponse;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.service.ProgrammeService;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProgrammeServiceImpl implements ProgrammeService {

    private static final String PROGRAMME_CODE_PREFIX = "PROG-";
    private static final Pattern LEADING_DIGITS = Pattern.compile("^(\\d+)");

    private final ProgrammeRepository programmeRepository;

    @Override
    public List<ProgrammeListResponse> getAllProgrammes() {
        return programmeRepository.findAll().stream()
                .map(programme -> ProgrammeListResponse.builder()
                        .id(programme.getId())
                        .programmeCode(programme.getProgrammeCode())
                        .programmeName(programme.getProgrammeName())
                        .description(programme.getDescription())
                        .isActive(programme.getIsActive())
                        .build())
                .toList();
    }

    @Override
    public ProgrammeResponse getProgrammeById(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
        return toResponse(programme);
    }

    @Override
    @Transactional
    public ProgrammeResponse createProgramme(CreateProgrammeRequest request) {
        String programmeCode = resolveProgrammeCode(request);

        Programme programme = Programme.builder()
                .programmeCode(programmeCode)
                .programmeName(request.getProgrammeName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return toResponse(programmeRepository.save(programme));
    }

    /** Use the supplied code, or generate the next PROG-NNN in sequence. */
    private String resolveProgrammeCode(CreateProgrammeRequest request) {
        if (request.getProgrammeCode() != null && !request.getProgrammeCode().isBlank()) {
            String code = request.getProgrammeCode().trim();
            programmeRepository.findByProgrammeCode(code).ifPresent(existing -> {
                throw new ValidationException("Programme code already exists",
                        Map.of("programmeCode", "A programme with this code already exists"));
            });
            return code;
        }
        int next = programmeRepository.findProgrammeCodesByPrefix(PROGRAMME_CODE_PREFIX).stream()
                .map(code -> code.substring(PROGRAMME_CODE_PREFIX.length()))
                .mapToInt(ProgrammeServiceImpl::leadingSequence)
                .max()
                .orElse(0) + 1;
        return String.format("%s%03d", PROGRAMME_CODE_PREFIX, next);
    }

    /** Parse the leading numeric run of a code suffix (e.g. "012-B" -> 12); 0 if none. */
    private static int leadingSequence(String suffix) {
        Matcher matcher = LEADING_DIGITS.matcher(suffix);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }

    @Override
    @Transactional
    public void activateProgramme(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
        programme.setIsActive(true);
    }

    @Override
    @Transactional
    public void deactivateProgramme(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
        programme.setIsActive(false);
    }

    private ProgrammeResponse toResponse(Programme programme) {
        return ProgrammeResponse.builder()
                .id(programme.getId())
                .programmeCode(programme.getProgrammeCode())
                .programmeName(programme.getProgrammeName())
                .description(programme.getDescription())
                .isActive(programme.getIsActive())
                .createdAt(programme.getCreatedAt())
                .updatedAt(programme.getUpdatedAt())
                .createdBy(programme.getCreatedBy())
                .updatedBy(programme.getUpdatedBy())
                .build();
    }
}
