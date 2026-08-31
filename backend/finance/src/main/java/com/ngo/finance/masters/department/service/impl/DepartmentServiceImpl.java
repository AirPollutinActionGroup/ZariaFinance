package com.ngo.finance.masters.department.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.masters.department.dto.request.CreateDepartmentRequest;
import com.ngo.finance.masters.department.dto.request.UpdateDepartmentRequest;
import com.ngo.finance.masters.department.dto.response.DepartmentResponse;
import com.ngo.finance.masters.department.entity.Department;
import com.ngo.finance.masters.department.mapper.DepartmentMapper;
import com.ngo.finance.masters.department.repository.DepartmentRepository;
import com.ngo.finance.masters.department.service.DepartmentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Department operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    private final DepartmentMapper departmentMapper;

    @Override
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {
        log.info("Registering new department: {}", request.getName());

        if (departmentRepository.existsByName(request.getName())) {
            throw new ValidationException("A department with name '" + request.getName() + "' already exists");
        }

        Department department = departmentMapper.toEntity(request);
        department.setStatus(request.getStatus() == null || request.getStatus());

        Department saved = departmentRepository.save(department);
        log.info("Department registered successfully with id: {}", saved.getId());

        return departmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        log.debug("Fetching department with id: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        return departmentMapper.toResponse(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        log.debug("Fetching all departments");
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> searchDepartments(String searchTerm) {
        log.debug("Searching departments with term: {}", searchTerm);
        return departmentRepository.searchByName(searchTerm).stream()
                .map(departmentMapper::toResponse)
                .toList();
    }

    @Override
    public DepartmentResponse updateDepartment(Long id, UpdateDepartmentRequest request) {
        log.info("Updating department with id: {}", id);

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));

        if (request.getName() != null
                && !request.getName().equals(department.getName())
                && departmentRepository.existsByName(request.getName())) {
            throw new ValidationException("A department with name '" + request.getName() + "' already exists");
        }

        departmentMapper.updateEntity(request, department);

        Department updated = departmentRepository.save(department);
        log.info("Department updated successfully");

        return departmentMapper.toResponse(updated);
    }

    @Override
    public void activateDepartment(Long id) {
        log.info("Activating department with id: {}", id);

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));

        department.setStatus(true);
        departmentRepository.save(department);

        log.info("Department activated successfully");
    }

    @Override
    public void deactivateDepartment(Long id) {
        log.info("Deactivating department with id: {}", id);

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));

        department.setStatus(false);
        departmentRepository.save(department);

        log.info("Department deactivated successfully");
    }
}
