package com.ngo.finance.employee.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.entity.CityMaster;
import com.ngo.finance.donor.entity.StateMaster;
import com.ngo.finance.donor.repository.CityRepository;
import com.ngo.finance.donor.repository.StateRepository;
import com.ngo.finance.employee.EmployeeStatuses;
import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.request.UpdateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.dto.response.EmployeeUpdateLogResponse;
import com.ngo.finance.employee.entity.Employee;
import com.ngo.finance.employee.entity.EmployeeUpdateLog;
import com.ngo.finance.employee.mapper.EmployeeMapper;
import com.ngo.finance.employee.repository.EmployeeRepository;
import com.ngo.finance.employee.repository.EmployeeUpdateLogRepository;
import com.ngo.finance.employee.service.EmployeeDocumentService;
import com.ngo.finance.employee.service.EmployeeService;
import com.ngo.finance.masters.department.entity.Department;
import com.ngo.finance.masters.department.repository.DepartmentRepository;
import com.ngo.finance.masters.designation.entity.Designation;
import com.ngo.finance.masters.designation.repository.DesignationRepository;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    private final StateRepository stateRepository;

    private final CityRepository cityRepository;

    private final EmployeeUpdateLogRepository employeeUpdateLogRepository;

    private final EmployeeMapper employeeMapper;

    private final EmployeeDocumentService employeeDocumentService;

    /** Resolved + validated master-data references shared by create and update. */
    private record RelatedEntities(
            Department department, Designation designation, List<StateMaster> states, List<CityMaster> cities) {
    }

    @Override
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        log.info("Registering new employee: {}", request.getEmpId());

        if (employeeRepository.existsByEmpId(request.getEmpId())) {
            throw new ValidationException("An employee with ID '" + request.getEmpId() + "' already exists");
        }

        RelatedEntities related = resolveAndValidateRelated(
                request.getDepartmentId(), request.getDesignationId(), request.getStateIds(), request.getCityIds());

        Employee employee = employeeMapper.toEntity(request);
        applyRelated(employee, related);
        normaliseBankingAndPan(employee);
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

        Map<String, String> before = buildFieldSnapshot(employee, requireDepartment(employee.getDepartmentId()),
                requireDesignation(employee.getDesignationId()), stateRepository.findAllById(employee.getStateIds()),
                cityRepository.findAllById(employee.getCityIds()));

        RelatedEntities related = resolveAndValidateRelated(
                request.getDepartmentId(), request.getDesignationId(), request.getStateIds(), request.getCityIds());

        employeeMapper.updateEntity(request, employee);
        applyRelated(employee, related);
        normaliseBankingAndPan(employee);
        employee.setStatus(request.getStatus());

        Employee saved = employeeRepository.save(employee);
        log.info("Employee updated successfully");

        Map<String, String> after = buildFieldSnapshot(saved, related);
        recordFieldChanges(saved.getId(), before, after);

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
                        cityRepository.findAllById(employee.getCityIds())));
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
        String previousStatus = employee.getStatus();
        employee.setStatus(status);
        employeeRepository.save(employee);
        if (!Objects.equals(previousStatus, status)) {
            employeeUpdateLogRepository.save(EmployeeUpdateLog.builder()
                    .employeeId(id)
                    .fieldName("Status")
                    .oldValue(previousStatus)
                    .newValue(status)
                    .build());
        }
        log.info("Employee status updated successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeUpdateLogResponse> getUpdateLogs(Long id) {
        log.debug("Fetching update logs for employee with id: {}", id);
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee", id);
        }
        return employeeUpdateLogRepository.findByEmployeeIdOrderByCreatedAtDesc(id).stream()
                .map(entry -> EmployeeUpdateLogResponse.builder()
                        .id(entry.getId())
                        .fieldName(entry.getFieldName())
                        .oldValue(entry.getOldValue())
                        .newValue(entry.getNewValue())
                        .changedAt(entry.getCreatedAt())
                        .changedBy(entry.getCreatedBy())
                        .build())
                .toList();
    }

    /** Resolves department/designation/states/cities and enforces the cross-field rules. */
    private RelatedEntities resolveAndValidateRelated(
            Long departmentId, Long designationId, List<Long> stateIds, List<Long> cityIds) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
        Designation designation = designationRepository.findById(designationId)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", designationId));
        if (!designation.getDepartmentId().equals(department.getId())) {
            throw new ValidationException("Selected designation does not belong to the selected department");
        }

        List<StateMaster> states = findAllOrThrow(stateRepository, stateIds, "State");
        List<CityMaster> cities = cityIds == null ? List.of() : findAllOrThrow(cityRepository, cityIds, "City");

        return new RelatedEntities(department, designation, states, cities);
    }

    /** Human-readable field-name -> display-value snapshot, for diffing before/after an edit. */
    private Map<String, String> buildFieldSnapshot(Employee employee, RelatedEntities related) {
        return buildFieldSnapshot(employee, related.department(), related.designation(), related.states(),
                related.cities());
    }

    private Map<String, String> buildFieldSnapshot(
            Employee employee, Department department, Designation designation, List<StateMaster> states,
            List<CityMaster> cities) {
        Map<String, String> snapshot = new LinkedHashMap<>();
        snapshot.put("Employee ID", employee.getEmpId());
        snapshot.put("Name", employee.getName());
        snapshot.put("Department", department.getName());
        snapshot.put("Designation", designation.getName());
        snapshot.put("Bucket", employee.getBucket());
        snapshot.put("State", joinNames(states.stream().map(StateMaster::getStateName).toList()));
        snapshot.put("City", joinNames(cities.stream().map(CityMaster::getCityName).toList()));
        snapshot.put("Joining Date", String.valueOf(employee.getJoiningDate()));
        snapshot.put("Exit Date", employee.getExitDate() != null ? employee.getExitDate().toString() : "");
        snapshot.put("Annual CTC", employee.getAnnualCtc() != null
                ? employee.getAnnualCtc().stripTrailingZeros().toPlainString() : "");
        snapshot.put("Employment Type", employee.getEmploymentType());
        snapshot.put("PF", employee.getPf());
        snapshot.put("ESI", employee.getEsi());
        snapshot.put("Gratuity", employee.getGratuity());
        snapshot.put("Status", employee.getStatus());
        snapshot.put("Remark", employee.getRemark() != null ? employee.getRemark() : "");
        snapshot.put("PAN Number", nullToEmpty(employee.getPanNumber()));
        snapshot.put("Account Holder Name", nullToEmpty(employee.getAccountHolderName()));
        snapshot.put("Bank Name", nullToEmpty(employee.getBankName()));
        snapshot.put("Account Type", nullToEmpty(employee.getAccountType()));
        snapshot.put("Account Number", maskAccountNumber(employee.getAccountNumber()));
        snapshot.put("IFSC Code", nullToEmpty(employee.getIfscCode()));
        snapshot.put("Branch Name", nullToEmpty(employee.getBranchName()));
        return snapshot;
    }

    private static String nullToEmpty(String value) {
        return value != null ? value : "";
    }

    /** The update log shows only the last four digits of an account number. */
    private static String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.isEmpty()) {
            return "";
        }
        return accountNumber.length() <= 4 ? accountNumber : "XXXX" + accountNumber.substring(accountNumber.length() - 4);
    }

    /** Trims the optional PAN / bank fields, blanks become null, PAN and IFSC are upper-cased. */
    private static void normaliseBankingAndPan(Employee employee) {
        employee.setPanNumber(upper(blankToNull(employee.getPanNumber())));
        employee.setAccountHolderName(blankToNull(employee.getAccountHolderName()));
        employee.setBankName(blankToNull(employee.getBankName()));
        employee.setAccountType(blankToNull(employee.getAccountType()));
        employee.setAccountNumber(blankToNull(employee.getAccountNumber()));
        employee.setIfscCode(upper(blankToNull(employee.getIfscCode())));
        employee.setBranchName(blankToNull(employee.getBranchName()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String upper(String value) {
        return value == null ? null : value.toUpperCase(java.util.Locale.ROOT);
    }

    private String joinNames(List<String> names) {
        return names.isEmpty() ? "" : String.join(", ", names);
    }

    /** Writes one log row per field whose display value actually changed. */
    private void recordFieldChanges(Long employeeId, Map<String, String> before, Map<String, String> after) {
        for (Map.Entry<String, String> field : before.entrySet()) {
            String oldValue = field.getValue();
            String newValue = after.get(field.getKey());
            if (!Objects.equals(oldValue, newValue)) {
                employeeUpdateLogRepository.save(EmployeeUpdateLog.builder()
                        .employeeId(employeeId)
                        .fieldName(field.getKey())
                        .oldValue(oldValue)
                        .newValue(newValue)
                        .build());
            }
        }
    }

    private void applyRelated(Employee employee, RelatedEntities related) {
        employee.setStateIds(related.states().stream().map(StateMaster::getId).collect(Collectors.toSet()));
        employee.setCityIds(related.cities().stream().map(CityMaster::getId).collect(Collectors.toSet()));
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
        response.setDocuments(employeeDocumentService.listFor(List.of(employee.getId()))
                .getOrDefault(employee.getId(), List.of()));
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

        Map<Long, StateMaster> statesById = stateRepository.findAllById(allStateIds).stream()
                .collect(Collectors.toMap(StateMaster::getId, Function.identity()));
        Map<Long, CityMaster> citiesById = cityRepository.findAllById(allCityIds).stream()
                .collect(Collectors.toMap(CityMaster::getId, Function.identity()));

        return employees.stream()
                .map(employee -> {
                    EmployeeResponse response = employeeMapper.toResponse(employee);
                    Department department = departmentsById.get(employee.getDepartmentId());
                    Designation designation = designationsById.get(employee.getDesignationId());
                    response.setDepartmentName(department != null ? department.getName() : null);
                    response.setDesignationName(designation != null ? designation.getName() : null);
                    response.setStateNames(resolveNames(employee.getStateIds(), statesById, StateMaster::getStateName));
                    response.setCityNames(resolveNames(employee.getCityIds(), citiesById, CityMaster::getCityName));
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
