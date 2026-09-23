package com.ngo.finance.employeeallocation.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.entity.CityMaster;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.employee.entity.Employee;
import com.ngo.finance.employee.repository.EmployeeRepository;
import com.ngo.finance.employeeallocation.dto.request.CreateEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationResponse;
import com.ngo.finance.employeeallocation.entity.EmployeeAllocation;
import com.ngo.finance.employeeallocation.repository.EmployeeAllocationRepository;
import com.ngo.finance.employeeallocation.service.EmployeeAllocationService;
import com.ngo.finance.programme.ProgrammeTypes;
import com.ngo.finance.programme.entity.Programme;
import com.ngo.finance.programme.repository.ProgrammeRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EmployeeAllocationServiceImpl implements EmployeeAllocationService {

    private final EmployeeAllocationRepository employeeAllocationRepository;
    private final EmployeeRepository employeeRepository;
    private final ProgrammeRepository programmeRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    /** Resolved + validated related entities shared by create. */
    private record RelatedEntities(
            Employee employee, Programme programme, Programme project, List<StateMaster> states, List<CityMaster> cities) {
    }

    @Override
    public List<EmployeeAllocationResponse> getAllAllocations() {
        List<EmployeeAllocation> allocations = employeeAllocationRepository.findAll();
        if (allocations.isEmpty()) {
            return List.of();
        }

        Map<Long, Employee> employeesById = employeeRepository
                .findAllById(allocations.stream().map(EmployeeAllocation::getEmployeeId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Employee::getId, Function.identity()));

        Map<Long, Programme> programmesById = programmeRepository
                .findAllById(allocations.stream()
                        .flatMap(a -> Stream.of(a.getProgrammeId(), a.getProjectId()))
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Programme::getId, Function.identity()));

        Map<Long, StateMaster> statesById = stateRepository
                .findAllById(allocations.stream().flatMap(a -> a.getStateIds().stream()).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(StateMaster::getId, Function.identity()));

        Map<Long, CityMaster> citiesById = cityRepository
                .findAllById(allocations.stream().flatMap(a -> a.getCityIds().stream()).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(CityMaster::getId, Function.identity()));

        return allocations.stream()
                .map(allocation -> toResponse(allocation, employeesById, programmesById, statesById, citiesById))
                .toList();
    }

    @Override
    @Transactional
    public EmployeeAllocationResponse createAllocation(CreateEmployeeAllocationRequest request) {
        RelatedEntities related = resolveAndValidateRelated(request);
        validateDates(request.getStartDate(), request.getEndDate());
        validateHeadroom(request.getEmployeeId(), request.getAllocationPct());

        EmployeeAllocation allocation = EmployeeAllocation.builder()
                .employeeId(related.employee().getId())
                .programmeId(related.programme().getId())
                .projectId(related.project().getId())
                .role(request.getRole() != null ? request.getRole().trim() : null)
                .stateIds(related.states().stream().map(StateMaster::getId).collect(Collectors.toSet()))
                .cityIds(related.cities().stream().map(CityMaster::getId).collect(Collectors.toSet()))
                .allocationPct(request.getAllocationPct())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .remark(request.getRemark() != null ? request.getRemark().trim() : null)
                .build();

        EmployeeAllocation saved = employeeAllocationRepository.save(allocation);
        return toResponse(saved, related.employee(), related.programme(), related.project(), related.states(), related.cities());
    }

    @Override
    @Transactional
    public void deleteAllocation(Long id) {
        if (!employeeAllocationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee allocation", id);
        }
        employeeAllocationRepository.deleteById(id);
    }

    private RelatedEntities resolveAndValidateRelated(CreateEmployeeAllocationRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getEmployeeId()));

        Programme programme = programmeRepository.findById(request.getProgrammeId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme", request.getProgrammeId()));
        if (ProgrammeTypes.PROJECT.equals(programme.getType())) {
            throw new ValidationException("Program must not be a project",
                    Map.of("programmeId", "Selected program is a project, not a program"));
        }

        Programme project = programmeRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Programme", request.getProjectId()));
        if (!ProgrammeTypes.PROJECT.equals(project.getType())) {
            throw new ValidationException("Project must be a project",
                    Map.of("projectId", "Selected project is not a project"));
        }
        if (!request.getProgrammeId().equals(project.getParentProgrammeId())) {
            throw new ValidationException("Project does not belong to the selected program",
                    Map.of("projectId", "Selected project does not belong to the selected program"));
        }

        List<Long> stateIds = request.getStateIds();
        List<Long> cityIds = request.getCityIds();
        List<StateMaster> states = (stateIds == null || stateIds.isEmpty())
                ? List.of()
                : findAllOrThrow(stateRepository, stateIds, "State");
        List<CityMaster> cities = (cityIds == null || cityIds.isEmpty())
                ? List.of()
                : findAllOrThrow(cityRepository, cityIds, "City");

        return new RelatedEntities(employee, programme, project, states, cities);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new ValidationException("End date cannot be before start date",
                    Map.of("endDate", "End date cannot be before start date"));
        }
    }

    /** An employee's allocations must never sum to more than 100%. */
    private void validateHeadroom(Long employeeId, Integer allocationPct) {
        int existingTotal = employeeAllocationRepository.findByEmployeeId(employeeId).stream()
                .mapToInt(EmployeeAllocation::getAllocationPct)
                .sum();
        int remaining = 100 - existingTotal;
        if (allocationPct > remaining) {
            throw new ValidationException(
                    "Only " + remaining + "% remaining for this employee — total allocation cannot exceed 100%.",
                    Map.of("allocationPct", "Only " + remaining
                            + "% remaining for this employee — total allocation cannot exceed 100%."));
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

    private EmployeeAllocationResponse toResponse(
            EmployeeAllocation allocation,
            Map<Long, Employee> employeesById,
            Map<Long, Programme> programmesById,
            Map<Long, StateMaster> statesById,
            Map<Long, CityMaster> citiesById) {
        Employee employee = employeesById.get(allocation.getEmployeeId());
        Programme programme = programmesById.get(allocation.getProgrammeId());
        Programme project = programmesById.get(allocation.getProjectId());

        return EmployeeAllocationResponse.builder()
                .id(allocation.getId())
                .employeeId(allocation.getEmployeeId())
                .employeeName(employee != null ? employee.getName() : null)
                .empCode(employee != null ? employee.getEmpId() : null)
                .programmeId(allocation.getProgrammeId())
                .programmeName(programme != null ? programme.getProgrammeName() : null)
                .projectId(allocation.getProjectId())
                .projectName(project != null ? project.getProgrammeName() : null)
                .role(allocation.getRole())
                .stateIds(new ArrayList<>(allocation.getStateIds()))
                .stateNames(allocation.getStateIds().stream()
                        .map(statesById::get)
                        .filter(Objects::nonNull)
                        .map(StateMaster::getStateName)
                        .toList())
                .cityIds(new ArrayList<>(allocation.getCityIds()))
                .cityNames(allocation.getCityIds().stream()
                        .map(citiesById::get)
                        .filter(Objects::nonNull)
                        .map(CityMaster::getCityName)
                        .toList())
                .allocationPct(allocation.getAllocationPct())
                .startDate(allocation.getStartDate())
                .endDate(allocation.getEndDate())
                .remark(allocation.getRemark())
                .createdAt(allocation.getCreatedAt())
                .updatedAt(allocation.getUpdatedAt())
                .createdBy(allocation.getCreatedBy())
                .updatedBy(allocation.getUpdatedBy())
                .build();
    }

    private EmployeeAllocationResponse toResponse(
            EmployeeAllocation allocation,
            Employee employee,
            Programme programme,
            Programme project,
            List<StateMaster> states,
            List<CityMaster> cities) {
        return EmployeeAllocationResponse.builder()
                .id(allocation.getId())
                .employeeId(allocation.getEmployeeId())
                .employeeName(employee.getName())
                .empCode(employee.getEmpId())
                .programmeId(allocation.getProgrammeId())
                .programmeName(programme.getProgrammeName())
                .projectId(allocation.getProjectId())
                .projectName(project.getProgrammeName())
                .role(allocation.getRole())
                .stateIds(new ArrayList<>(allocation.getStateIds()))
                .stateNames(states.stream().map(StateMaster::getStateName).toList())
                .cityIds(new ArrayList<>(allocation.getCityIds()))
                .cityNames(cities.stream().map(CityMaster::getCityName).toList())
                .allocationPct(allocation.getAllocationPct())
                .startDate(allocation.getStartDate())
                .endDate(allocation.getEndDate())
                .remark(allocation.getRemark())
                .createdAt(allocation.getCreatedAt())
                .updatedAt(allocation.getUpdatedAt())
                .createdBy(allocation.getCreatedBy())
                .updatedBy(allocation.getUpdatedBy())
                .build();
    }
}
