package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.dto.response.DonorResponse;
import com.ngo.finance.donor.entity.DonorMaster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for Donor entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface DonorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "grants", ignore = true)
    @Mapping(target = "mapping", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "onboardingStep", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    DonorMaster toEntity(CreateDonorRequest request);

    @Mapping(source = "city.id", target = "cityId")
    @Mapping(source = "city.cityName", target = "cityName")
    @Mapping(source = "state.id", target = "stateId")
    @Mapping(source = "state.stateName", target = "stateName")
    DonorResponse toResponse(DonorMaster entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "contacts", ignore = true)
    @Mapping(target = "grants", ignore = true)
    @Mapping(target = "mapping", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "onboardingStep", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "donorCode", ignore = true)
    void updateEntity(CreateDonorRequest request, @MappingTarget DonorMaster entity);
}
