package com.ngo.finance.employee.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.donor.entity.Programme;
import com.ngo.finance.donor.repository.ProgrammeRepository;
import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.entity.Employee;
import com.ngo.finance.employee.mapper.EmployeeMapper;
import com.ngo.finance.employee.repository.EmployeeRepository;
import com.ngo.finance.employee.service.EmployeeService;
import com.ngo.finance.masters.department.entity.Department;
import com.ngo.finance.masters.department.repository.DepartmentRepository;
import com.ngo.finance.masters.designation.entity.Designation;
import com.ngo.finance.masters.designation.repository.DesignationRepository;
import java.util.List;
import java.util.Map;
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

    private final EmployeeMapper employeeMapper;

    @Override
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        log.info("Registering new employee: {}", request.getEmpId());

        if (employeeRepository.existsByEmpId(request.getEmpId())) {
            throw new ValidationException("An employee with ID '" + request.getEmpId() + "' already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
        Designation designation = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new ResourceNotFoundException("Designation", request.getDesignationId()));
        if (!designation.getDepartmentId().equals(department.getId())) {
            throw new ValidationException("Selected designation does not belong to the selected department");
        }

        boolean isProject = "Project".equals(request.getBucket());
        Programme programme = null;
        if (isProject) {
            if (request.getPrimaryProgrammeId() == null) {
                throw new ValidationException("Primary programme is required for the Project bucket");
            }
            programme = programmeRepository.findById(request.getPrimaryProgrammeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Programme", request.getPrimaryProgrammeId()));
        }

        Employee employee = employeeMapper.toEntity(request);
        employee.setStatus(request.getStatus() == null || request.getStatus());
        employee.setPrimaryProgrammeId(isProject ? programme.getId() : null);

        Employee saved = employeeRepository.save(employee);
        log.info("Employee registered successfully with id: {}", saved.getId());

        return toResponseWithNames(saved, department, designation, programme);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        log.debug("Fetching employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        Programme programme = employee.getPrimaryProgrammeId() != null
                ? requireProgramme(employee.getPrimaryProgrammeId())
                : null;
        return toResponseWithNames(
                employee, requireDepartment(employee.getDepartmentId()), requireDesignation(employee.getDesignationId()), programme);
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
    public void activateEmployee(Long id) {
        log.info("Activating employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        employee.setStatus(true);
        employeeRepository.save(employee);
        log.info("Employee activated successfully");
    }

    @Override
    public void deactivateEmployee(Long id) {
        log.info("Deactivating employee with id: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        employee.setStatus(false);
        employeeRepository.save(employee);
        log.info("Employee deactivated successfully");
    }

    private Department requireDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
    }

    private Designation requireDesignation(Long designationId) {
        return designationRepository.findById(designationId)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", designationId));
    }

    private Programme requireProgramme(Long programmeId) {
        return programmeRepository.findById(programmeId)
                .orElseThrow(() -> new ResourceNotFoundException("Programme", programmeId));
    }

    private EmployeeResponse toResponseWithNames(
            Employee employee, Department department, Designation designation, Programme programme) {
        EmployeeResponse response = employeeMapper.toResponse(employee);
        response.setDepartmentName(department.getName());
        response.setDesignationName(designation.getName());
        response.setPrimaryProgrammeName(programme != null ? programme.getProgrammeName() : null);
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
        Map<Long, Programme> programmesById = programmeRepository
                .findAllById(employees.stream()
                        .map(Employee::getPrimaryProgrammeId)
                        .filter(java.util.Objects::nonNull)
                        .distinct()
                        .toList())
                .stream()
                .collect(Collectors.toMap(Programme::getId, Function.identity()));

        return employees.stream()
                .map(employee -> {
                    EmployeeResponse response = employeeMapper.toResponse(employee);
                    Department department = departmentsById.get(employee.getDepartmentId());
                    Designation designation = designationsById.get(employee.getDesignationId());
                    Programme programme = programmesById.get(employee.getPrimaryProgrammeId());
                    response.setDepartmentName(department != null ? department.getName() : null);
                    response.setDesignationName(designation != null ? designation.getName() : null);
                    response.setPrimaryProgrammeName(programme != null ? programme.getProgrammeName() : null);
                    return response;
                })
                .toList();
    }
}
