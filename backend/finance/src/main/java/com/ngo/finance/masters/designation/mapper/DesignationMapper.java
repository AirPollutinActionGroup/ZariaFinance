package com.ngo.finance.masters.designation.mapper;

import com.ngo.finance.masters.designation.dto.request.CreateDesignationRequest;
import com.ngo.finance.masters.designation.dto.request.UpdateDesignationRequest;
import com.ngo.finance.masters.designation.dto.response.DesignationResponse;
import com.ngo.finance.masters.designation.entity.Designation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for Designation entity to/from DTOs.
 *
 * departmentName is not on the entity — it's resolved by the service layer
 * from the referenced Department and set on the response afterwards.
 */
@Mapper(componentModel = "spring")
public interface DesignationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Designation toEntity(CreateDesignationRequest request);

    @Mapping(target = "departmentName", ignore = true)
    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    DesignationResponse toResponse(Designation entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateDesignationRequest request, @MappingTarget Designation entity);
}
