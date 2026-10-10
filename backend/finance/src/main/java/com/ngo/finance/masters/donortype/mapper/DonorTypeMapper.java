package com.ngo.finance.masters.donortype.mapper;

import com.ngo.finance.masters.donortype.dto.request.CreateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.request.UpdateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.response.DonorTypeResponse;
import com.ngo.finance.masters.donortype.entity.DonorTypeMaster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for DonorTypeMaster entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface DonorTypeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    DonorTypeMaster toEntity(CreateDonorTypeRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    DonorTypeResponse toResponse(DonorTypeMaster entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "allowedFundSourceDomiciles", ignore = true)
    @Mapping(target = "allowedContributionTypes", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateDonorTypeRequest request, @MappingTarget DonorTypeMaster entity);
}
