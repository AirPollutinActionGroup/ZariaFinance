package com.ngo.finance.employee.mapper;

import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.request.UpdateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for Employee entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Employee toEntity(CreateEmployeeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateEmployeeRequest request, @MappingTarget Employee entity);

    @Mapping(target = "departmentName", ignore = true)
    @Mapping(target = "designationName", ignore = true)
    @Mapping(target = "primaryProgrammeNames", ignore = true)
    @Mapping(target = "stateNames", ignore = true)
    @Mapping(target = "cityNames", ignore = true)
    EmployeeResponse toResponse(Employee entity);
}
