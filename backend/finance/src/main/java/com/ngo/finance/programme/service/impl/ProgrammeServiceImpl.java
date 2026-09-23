package com.ngo.finance.programme.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.entity.CityMaster;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.programme.ProgrammeStatuses;
import com.ngo.finance.programme.ProgrammeTypes;
import com.ngo.finance.programme.dto.request.CreateProgrammeRequest;
import com.ngo.finance.programme.dto.response.ProgrammeListResponse;
import com.ngo.finance.programme.dto.response.ProgrammeResponse;
import com.ngo.finance.programme.entity.Programme;
import com.ngo.finance.programme.repository.ProgrammeRepository;
import com.ngo.finance.programme.service.ProgrammeService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProgrammeServiceImpl implements ProgrammeService {

    private static final String PROGRAMME_CODE_PREFIX = "PROG-";
    private static final String PROJECT_CODE_PREFIX = "PRJ-";
    private static final Pattern LEADING_DIGITS = Pattern.compile("^(\\d+)");

    private final ProgrammeRepository programmeRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    /** Resolved + validated related entities shared by create. */
    private record RelatedEntities(Programme parent, List<StateMaster> states, List<CityMaster> cities) {
    }

    @Override
    public List<ProgrammeListResponse> getAllProgrammes() {
        List<Programme> programmes = programmeRepository.findAll();

        Set<Long> parentIds = programmes.stream()
                .map(Programme::getParentProgrammeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Programme> parentsById = programmeRepository.findAllById(parentIds).stream()
                .collect(Collectors.toMap(Programme::getId, Function.identity()));

        Set<Long> allStateIds = programmes.stream().flatMap(p -> p.getStateIds().stream()).collect(Collectors.toSet());
        Set<Long> allCityIds = programmes.stream().flatMap(p -> p.getCityIds().stream()).collect(Collectors.toSet());
        Map<Long, StateMaster> statesById = stateRepository.findAllById(allStateIds).stream()
                .collect(Collectors.toMap(StateMaster::getId, Function.identity()));
        Map<Long, CityMaster> citiesById = cityRepository.findAllById(allCityIds).stream()
                .collect(Collectors.toMap(CityMaster::getId, Function.identity()));

        return programmes.stream()
                .map(programme -> {
                    Programme parent = programme.getParentProgrammeId() != null
                            ? parentsById.get(programme.getParentProgrammeId())
                            : null;
                    return ProgrammeListResponse.builder()
                            .id(programme.getId())
                            .programmeCode(programme.getProgrammeCode())
                            .programmeName(programme.getProgrammeName())
                            .description(programme.getDescription())
                            .isActive(programme.getIsActive())
                            .type(programme.getType())
                            .parentProgrammeId(programme.getParentProgrammeId())
                            .parentProgrammeName(parent != null ? parent.getProgrammeName() : null)
                            .startDate(programme.getStartDate())
                            .endDate(programme.getEndDate())
                            .stateNames(resolveNames(programme.getStateIds(), statesById, StateMaster::getStateName))
                            .cityNames(resolveNames(programme.getCityIds(), citiesById, CityMaster::getCityName))
                            .status(programme.getStatus())
                            .build();
                })
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
        String type = normalizeType(request.getType());
        String programmeCode = resolveProgrammeCode(request, type);

        RelatedEntities related = resolveAndValidateRelated(
                type, request.getParentProgrammeId(), request.getStateIds(), request.getCityIds());
        validateDates(request.getStartDate(), request.getEndDate());

        String status = (request.getStatus() == null || request.getStatus().isBlank())
                ? ProgrammeStatuses.ACTIVE
                : request.getStatus();
        boolean isActive = request.getIsActive() != null
                ? request.getIsActive()
                : ProgrammeStatuses.ACTIVE.equals(status);

        Programme programme = Programme.builder()
                .programmeCode(programmeCode)
                .programmeName(request.getProgrammeName())
                .description(request.getDescription())
                .isActive(isActive)
                .type(type)
                .parentProgrammeId(related.parent() != null ? related.parent().getId() : null)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .stateIds(related.states().stream().map(StateMaster::getId).collect(Collectors.toSet()))
                .cityIds(related.cities().stream().map(CityMaster::getId).collect(Collectors.toSet()))
                .status(status)
                .build();

        return toResponse(programmeRepository.save(programme));
    }

    /**
     * Use the supplied code, or generate the next code in sequence — PROG-NNN
     * for a Programme, PRJ-NNN for a Project, each numbered independently.
     */
    private String resolveProgrammeCode(CreateProgrammeRequest request, String type) {
        if (request.getProgrammeCode() != null && !request.getProgrammeCode().isBlank()) {
            String code = request.getProgrammeCode().trim();
            programmeRepository.findByProgrammeCode(code).ifPresent(existing -> {
                throw new ValidationException("Programme code already exists",
                        Map.of("programmeCode", "A programme with this code already exists"));
            });
            return code;
        }
        String prefix = ProgrammeTypes.PROJECT.equals(type) ? PROJECT_CODE_PREFIX : PROGRAMME_CODE_PREFIX;
        int next = programmeRepository.findProgrammeCodesByPrefix(prefix).stream()
                .map(code -> code.substring(prefix.length()))
                .mapToInt(ProgrammeServiceImpl::leadingSequence)
                .max()
                .orElse(0) + 1;
        return String.format("%s%03d", prefix, next);
    }

    /** Parse the leading numeric run of a code suffix (e.g. "012-B" -> 12); 0 if none. */
    private static int leadingSequence(String suffix) {
        Matcher matcher = LEADING_DIGITS.matcher(suffix);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }

    private String normalizeType(String type) {
        return (type == null || type.isBlank()) ? ProgrammeTypes.PROGRAMME : type;
    }

    /** Resolves + validates the parent programme (Project only) and the state/city selections. */
    private RelatedEntities resolveAndValidateRelated(
            String type, Long parentProgrammeId, List<Long> stateIds, List<Long> cityIds) {
        Programme parent = null;
        if (ProgrammeTypes.PROJECT.equals(type)) {
            if (parentProgrammeId == null) {
                throw new ValidationException("Parent programme is required for a project",
                        Map.of("parentProgrammeId", "Parent programme is required for a project"));
            }
            parent = programmeRepository.findById(parentProgrammeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Programme", parentProgrammeId));
            if (ProgrammeTypes.PROJECT.equals(parent.getType())) {
                throw new ValidationException("Parent must be a programme, not a project",
                        Map.of("parentProgrammeId", "Selected parent is a project, not a programme"));
            }
        }

        List<StateMaster> states = (stateIds == null || stateIds.isEmpty())
                ? List.of()
                : findAllOrThrow(stateRepository, stateIds, "State");
        List<CityMaster> cities = (cityIds == null || cityIds.isEmpty())
                ? List.of()
                : findAllOrThrow(cityRepository, cityIds, "City");

        return new RelatedEntities(parent, states, cities);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new ValidationException("End date cannot be before start date",
                    Map.of("endDate", "End date cannot be before start date"));
        }
    }

    /** Fetches every id and throws if any is unknown — keeps "selected X doesn't exist" errors explicit. */
    private <T, ID> List<T> findAllOrThrow(JpaRepository<T, ID> repository, List<ID> ids, String resourceName) {
        List<T> found = repository.findAllById(ids);
        if (found.size() != new HashSet<>(ids).size()) {
            throw new ValidationException("One or more selected " + resourceName.toLowerCase() + "s do not exist");
        }
        return found;
    }

    @Override
    @Transactional
    public void activateProgramme(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
        programme.setIsActive(true);
        programme.setStatus(ProgrammeStatuses.ACTIVE);
    }

    @Override
    @Transactional
    public void deactivateProgramme(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
        programme.setIsActive(false);
        if (ProgrammeStatuses.ACTIVE.equals(programme.getStatus())) {
            programme.setStatus(ProgrammeStatuses.CLOSE);
        }
    }

    @Override
    @Transactional
    public ProgrammeResponse updateStatus(Long id, String status) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", id));
        programme.setStatus(status);
        programme.setIsActive(ProgrammeStatuses.ACTIVE.equals(status));
        return toResponse(programmeRepository.save(programme));
    }

    private ProgrammeResponse toResponse(Programme programme) {
        Programme parent = programme.getParentProgrammeId() != null
                ? programmeRepository.findById(programme.getParentProgrammeId()).orElse(null)
                : null;
        List<StateMaster> states = programme.getStateIds().isEmpty()
                ? List.of()
                : stateRepository.findAllById(programme.getStateIds());
        List<CityMaster> cities = programme.getCityIds().isEmpty()
                ? List.of()
                : cityRepository.findAllById(programme.getCityIds());

        return ProgrammeResponse.builder()
                .id(programme.getId())
                .programmeCode(programme.getProgrammeCode())
                .programmeName(programme.getProgrammeName())
                .description(programme.getDescription())
                .isActive(programme.getIsActive())
                .type(programme.getType())
                .parentProgrammeId(programme.getParentProgrammeId())
                .parentProgrammeName(parent != null ? parent.getProgrammeName() : null)
                .startDate(programme.getStartDate())
                .endDate(programme.getEndDate())
                .stateIds(new ArrayList<>(programme.getStateIds()))
                .stateNames(states.stream().map(StateMaster::getStateName).toList())
                .cityIds(new ArrayList<>(programme.getCityIds()))
                .cityNames(cities.stream().map(CityMaster::getCityName).toList())
                .status(programme.getStatus())
                .createdAt(programme.getCreatedAt())
                .updatedAt(programme.getUpdatedAt())
                .createdBy(programme.getCreatedBy())
                .updatedBy(programme.getUpdatedBy())
                .build();
    }

    private <T> List<String> resolveNames(Set<Long> ids, Map<Long, T> byId, Function<T, String> nameOf) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return ids.stream().map(byId::get).filter(Objects::nonNull).map(nameOf).toList();
    }
}
