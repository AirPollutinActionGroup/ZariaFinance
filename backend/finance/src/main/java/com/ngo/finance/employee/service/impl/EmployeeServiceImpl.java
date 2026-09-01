package com.ngo.finance.employee.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.entity.CityMaster;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.employee.EmployeeStatuses;
import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.request.UpdateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.entity.Employee;
import com.ngo.finance.employee.mapper.EmployeeMapper;
import com.ngo.finance.employee.repository.EmployeeRepository;
import com.ngo.finance.employee.service.EmployeeService;
import com.ngo.finance.masters.department.entity.Department;
import com.ngo.finance.masters.department.repository.DepartmentRepository;
import com.ngo.finance.masters.designation.entity.Designation;
import com.ngo.finance.masters.designation.repository.DesignationRepository;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Employee operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    private final DepartmentRepository departmentRepository;

    private final DesignationRepository designationRepository;

    private final ProgrammeRepository programmeRepository;

    private final StateRepository stateRepository;

    private final CityRepository cityRepository;

    private final EmployeeMapper employeeMapper;

    /** Resolved + validated master-data references shared by create and update. */
    private record RelatedEntities(
            Department department, Designation designation, List<StateMaster> states,
            List<CityMaster> cities, List<Programme> programmes) {
    }

    @Override
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        log.info("Registering new employee: {}", request.getEmpId());

        if (employeeRepository.existsByEmpId(request.getEmpId())) {
            throw new ValidationException("An employee with ID '" + request.getEmpId() + "' already exists");
        }

        RelatedEntities related = resolveAndValidateRelated(
                request.getDepartmentId(), request.getDesignationId(), request.getStateIds(),
                request.getCityIds(), request.getBucket(), request.getPrimaryProgrammeIds());

        Employee employee = employeeMapper.toEntity(request);
        applyRelated(employee, related);
        employee.setStatus(request.getStatus() == null || request.getStatus().isBlank()
                ? EmployeeStatuses.ACTIVE
                : request.getStatus());

        Employee saved = employeeRepository.save(employee);
        log.info("Employee registered successfully with id: {}", saved.getId());

        return toResponseWithNames(saved, related);
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        log.info("Updating employee with id: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));

        if (!request.getEmpId().equals(employee.getEmpId()) && employeeRepository.existsByEmpId(request.getEmpId())) {
            throw new ValidationException("An employee with ID '" + request.getEmpId() + "' already exists");
        }

        RelatedEntities related = resolveAndValidateRelated(
                request.getDepartmentId(), request.getDesignationId(), request.getStateIds(),
                request.getCityIds(), request.getBucket(), request.getPrimaryProgrammeIds());

        employeeMapper.updateEntity(request, employee);
        applyRelated(employee, related);
        employee.setStatus(request.getStatus());

        Employee saved = employeeRepository.save(employee);
        log.info("Employee updated successfully");

        return toResponseWithNames(saved, related);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        log.debug("Fetching employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        return toResponseWithNames(
                employee,
                new RelatedEntities(
                        requireDepartment(employee.getDepartmentId()),
                        requireDesignation(employee.getDesignationId()),
                        stateRepository.findAllById(employee.getStateIds()),
                        cityRepository.findAllById(employee.getCityIds()),
                        programmeRepository.findAllById(employee.getPrimaryProgrammeIds())));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        log.debug("Fetching all employees");
        return toResponsesWithNames(employeeRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> searchEmployees(String searchTerm) {
        log.debug("Searching employees with term: {}", searchTerm);
        return toResponsesWithNames(employeeRepository.searchEmployees(searchTerm));
    }

    @Override
    public void updateStatus(Long id, String status) {
        log.info("Updating status of employee with id: {} to {}", id, status);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        employee.setStatus(status);
        employeeRepository.save(employee);
        log.info("Employee status updated successfully");
    }

    /** Resolves department/designation/states/cities/programmes and enforces the cross-field rules. */
    private RelatedEntities resolveAndValidateRelated(
            Long departmentId, Long designationId, List<Long> stateIds, List<Long> cityIds,
            String bucket, List<Long> primaryProgrammeIds) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
        Designation designation = designationRepository.findById(designationId)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", designationId));
        if (!designation.getDepartmentId().equals(department.getId())) {
            throw new ValidationException("Selected designation does not belong to the selected department");
        }

        List<StateMaster> states = findAllOrThrow(stateRepository, stateIds, "State");
        List<CityMaster> cities = cityIds == null ? List.of() : findAllOrThrow(cityRepository, cityIds, "City");

        boolean isProject = "Project".equals(bucket);
        List<Programme> programmes;
        if (isProject) {
            if (primaryProgrammeIds == null || primaryProgrammeIds.isEmpty()) {
                throw new ValidationException("At least one primary programme is required for the Project bucket");
            }
            programmes = findAllOrThrow(programmeRepository, primaryProgrammeIds, "Programme");
        } else {
            programmes = List.of();
        }

        return new RelatedEntities(department, designation, states, cities, programmes);
    }

    private void applyRelated(Employee employee, RelatedEntities related) {
        employee.setStateIds(related.states().stream().map(StateMaster::getId).collect(Collectors.toSet()));
        employee.setCityIds(related.cities().stream().map(CityMaster::getId).collect(Collectors.toSet()));
        employee.setPrimaryProgrammeIds(related.programmes().stream().map(Programme::getId).collect(Collectors.toSet()));
    }

    private Department requireDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
    }

    private Designation requireDesignation(Long designationId) {
        return designationRepository.findById(designationId)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", designationId));
    }

    /** Fetches every id and throws if any is unknown — keeps "selected X doesn't exist" errors explicit. */
    private <T, ID> List<T> findAllOrThrow(
            org.springframework.data.jpa.repository.JpaRepository<T, ID> repository, List<ID> ids, String resourceName) {
        List<T> found = repository.findAllById(ids);
        if (found.size() != new HashSet<>(ids).size()) {
            throw new ValidationException("One or more selected " + resourceName.toLowerCase() + "s do not exist");
        }
        return found;
    }

    private EmployeeResponse toResponseWithNames(Employee employee, RelatedEntities related) {
        EmployeeResponse response = employeeMapper.toResponse(employee);
        response.setDepartmentName(related.department().getName());
        response.setDesignationName(related.designation().getName());
        response.setStateNames(related.states().stream().map(StateMaster::getStateName).toList());
        response.setCityNames(related.cities().stream().map(CityMaster::getCityName).toList());
        response.setPrimaryProgrammeNames(related.programmes().stream().map(Programme::getProgrammeName).toList());
        return response;
    }

    private List<EmployeeResponse> toResponsesWithNames(List<Employee> employees) {
        Map<Long, Department> departmentsById = departmentRepository
                .findAllById(employees.stream().map(Employee::getDepartmentId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Department::getId, Function.identity()));
        Map<Long, Designation> designationsById = designationRepository
                .findAllById(employees.stream().map(Employee::getDesignationId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Designation::getId, Function.identity()));

        Set<Long> allStateIds = employees.stream().flatMap(e -> e.getStateIds().stream()).collect(Collectors.toSet());
        Set<Long> allCityIds = employees.stream().flatMap(e -> e.getCityIds().stream()).collect(Collectors.toSet());
        Set<Long> allProgrammeIds =
                employees.stream().flatMap(e -> e.getPrimaryProgrammeIds().stream()).collect(Collectors.toSet());

        Map<Long, StateMaster> statesById = stateRepository.findAllById(allStateIds).stream()
                .collect(Collectors.toMap(StateMaster::getId, Function.identity()));
        Map<Long, CityMaster> citiesById = cityRepository.findAllById(allCityIds).stream()
                .collect(Collectors.toMap(CityMaster::getId, Function.identity()));
        Map<Long, Programme> programmesById = programmeRepository.findAllById(allProgrammeIds).stream()
                .collect(Collectors.toMap(Programme::getId, Function.identity()));

        return employees.stream()
                .map(employee -> {
                    EmployeeResponse response = employeeMapper.toResponse(employee);
                    Department department = departmentsById.get(employee.getDepartmentId());
                    Designation designation = designationsById.get(employee.getDesignationId());
                    response.setDepartmentName(department != null ? department.getName() : null);
                    response.setDesignationName(designation != null ? designation.getName() : null);
                    response.setStateNames(resolveNames(employee.getStateIds(), statesById, StateMaster::getStateName));
                    response.setCityNames(resolveNames(employee.getCityIds(), citiesById, CityMaster::getCityName));
                    response.setPrimaryProgrammeNames(
                            resolveNames(employee.getPrimaryProgrammeIds(), programmesById, Programme::getProgrammeName));
                    return response;
                })
                .toList();
    }

    private <T> List<String> resolveNames(Set<Long> ids, Map<Long, T> byId, Function<T, String> nameOf) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return ids.stream().map(byId::get).filter(java.util.Objects::nonNull).map(nameOf).toList();
    }
}
