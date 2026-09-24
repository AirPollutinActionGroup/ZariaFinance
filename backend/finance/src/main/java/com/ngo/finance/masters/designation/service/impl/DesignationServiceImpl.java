package com.ngo.finance.masters.designation.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.masters.department.entity.Department;
import com.ngo.finance.masters.department.repository.DepartmentRepository;
import com.ngo.finance.masters.designation.dto.request.CreateDesignationRequest;
import com.ngo.finance.masters.designation.dto.request.UpdateDesignationRequest;
import com.ngo.finance.masters.designation.dto.response.DesignationResponse;
import com.ngo.finance.masters.designation.entity.Designation;
import com.ngo.finance.masters.designation.mapper.DesignationMapper;
import com.ngo.finance.masters.designation.repository.DesignationRepository;
import com.ngo.finance.masters.designation.service.DesignationService;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Designation operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DesignationServiceImpl implements DesignationService {

    private final DesignationRepository designationRepository;

    private final DepartmentRepository departmentRepository;

    private final DesignationMapper designationMapper;

    @Override
    public DesignationResponse createDesignation(CreateDesignationRequest request) {
        log.info("Registering new designation: {}", request.getName());

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            if (designationRepository.existsByNameAndDepartmentId(request.getName(), request.getDepartmentId())) {
                throw new ValidationException(
                        "A designation with name '" + request.getName() + "' already exists in this department");
            }
        } else if (designationRepository.existsByNameAndDepartmentIdIsNull(request.getName())) {
            throw new ValidationException(
                    "A designation with name '" + request.getName() + "' already exists");
        }

        Designation designation = designationMapper.toEntity(request);
        designation.setStatus(request.getStatus() == null || request.getStatus());

        Designation saved = designationRepository.save(designation);
        log.info("Designation registered successfully with id: {}", saved.getId());

        return toResponseWithDepartment(saved, department);
    }

    @Override
    @Transactional(readOnly = true)
    public DesignationResponse getDesignationById(Long id) {
        log.debug("Fetching designation with id: {}", id);
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", id));
        return toResponseWithDepartment(designation,
                designation.getDepartmentId() != null ? requireDepartment(designation.getDepartmentId()) : null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DesignationResponse> getAllDesignations() {
        log.debug("Fetching all designations");
        return toResponsesWithDepartments(designationRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DesignationResponse> searchDesignations(String searchTerm) {
        log.debug("Searching designations with term: {}", searchTerm);
        return toResponsesWithDepartments(designationRepository.searchByName(searchTerm));
    }

    @Override
    public DesignationResponse updateDesignation(Long id, UpdateDesignationRequest request) {
        log.info("Updating designation with id: {}", id);

        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", id));

        Long targetDepartmentId = request.getDepartmentId() != null
                ? request.getDepartmentId()
                : designation.getDepartmentId();
        Department department = targetDepartmentId != null
                ? departmentRepository.findById(targetDepartmentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Department", targetDepartmentId))
                : null;

        String targetName = request.getName() != null ? request.getName() : designation.getName();
        boolean nameOrDeptChanged = !targetName.equals(designation.getName())
                || !java.util.Objects.equals(targetDepartmentId, designation.getDepartmentId());
        if (nameOrDeptChanged) {
            boolean duplicate = targetDepartmentId != null
                    ? designationRepository.existsByNameAndDepartmentId(targetName, targetDepartmentId)
                    : designationRepository.existsByNameAndDepartmentIdIsNull(targetName);
            if (duplicate) {
                throw new ValidationException(
                        "A designation with name '" + targetName + "' already exists"
                                + (targetDepartmentId != null ? " in this department" : ""));
            }
        }

        designationMapper.updateEntity(request, designation);

        Designation updated = designationRepository.save(designation);
        log.info("Designation updated successfully");

        return toResponseWithDepartment(updated, department);
    }

    @Override
    public void activateDesignation(Long id) {
        log.info("Activating designation with id: {}", id);

        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", id));

        designation.setStatus(true);
        designationRepository.save(designation);

        log.info("Designation activated successfully");
    }

    @Override
    public void deactivateDesignation(Long id) {
        log.info("Deactivating designation with id: {}", id);

        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", id));

        designation.setStatus(false);
        designationRepository.save(designation);

        log.info("Designation deactivated successfully");
    }

    private Department requireDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
    }

    private DesignationResponse toResponseWithDepartment(Designation designation, Department department) {
        DesignationResponse response = designationMapper.toResponse(designation);
        response.setDepartmentName(department != null ? department.getName() : null);
        return response;
    }

    private List<DesignationResponse> toResponsesWithDepartments(List<Designation> designations) {
        List<Long> departmentIds = designations.stream()
                .map(Designation::getDepartmentId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, Department> departmentsById = departmentRepository
                .findAllById(departmentIds)
                .stream()
                .collect(Collectors.toMap(Department::getId, Function.identity()));

        return designations.stream()
                .map(designation -> {
                    DesignationResponse response = designationMapper.toResponse(designation);
                    Department department = departmentsById.get(designation.getDepartmentId());
                    response.setDepartmentName(department != null ? department.getName() : null);
                    return response;
                })
                .toList();
    }
}
