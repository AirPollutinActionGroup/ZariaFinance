package com.ngo.finance.organizationRegister.mapper;

import com.ngo.finance.organizationRegister.dto.request.CreateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.request.UpdateOrganizationRequest;
import com.ngo.finance.organizationRegister.dto.response.OrganizationResponse;
import com.ngo.finance.organizationRegister.entity.OrganizationRegister;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for OrganizationRegister entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    OrganizationRegister toEntity(CreateOrganizationRequest request);

    @Mapping(source = "city.id", target = "cityId")
    @Mapping(source = "city.cityName", target = "cityName")
    @Mapping(source = "state.id", target = "stateId")
    @Mapping(source = "state.stateName", target = "stateName")
    OrganizationResponse toResponse(OrganizationRegister entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateOrganizationRequest request, @MappingTarget OrganizationRegister entity);
}
