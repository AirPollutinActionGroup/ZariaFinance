package com.ngo.finance.masters.department.mapper;

import com.ngo.finance.masters.department.dto.request.CreateDepartmentRequest;
import com.ngo.finance.masters.department.dto.request.UpdateDepartmentRequest;
import com.ngo.finance.masters.department.dto.response.DepartmentResponse;
import com.ngo.finance.masters.department.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for Department entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Department toEntity(CreateDepartmentRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    DepartmentResponse toResponse(Department entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateDepartmentRequest request, @MappingTarget Department entity);
}
