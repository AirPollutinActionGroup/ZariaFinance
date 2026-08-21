package com.ngo.finance.roleDirectory.mapper;

import com.ngo.finance.roleDirectory.dto.request.CreateRoleRequest;
import com.ngo.finance.roleDirectory.dto.request.UpdateRoleRequest;
import com.ngo.finance.roleDirectory.dto.response.RoleResponse;
import com.ngo.finance.roleDirectory.entity.RoleMaster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for RoleMaster entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    RoleMaster toEntity(CreateRoleRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    RoleResponse toResponse(RoleMaster entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateRoleRequest request, @MappingTarget RoleMaster entity);
}
