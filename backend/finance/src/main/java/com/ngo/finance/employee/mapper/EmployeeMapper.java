package com.ngo.finance.employee.mapper;

import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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

    @Mapping(target = "departmentName", ignore = true)
    @Mapping(target = "designationName", ignore = true)
    @Mapping(target = "primaryProgrammeName", ignore = true)
    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"Active\" : \"Inactive\")")
    EmployeeResponse toResponse(Employee entity);
}
