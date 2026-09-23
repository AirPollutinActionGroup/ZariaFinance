package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.response.GrantDetailsResponse;
import com.ngo.finance.donor.dto.response.GrantListResponse;
import com.ngo.finance.donor.entity.GrantAgreement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Grant Agreement entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface GrantMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "donor", ignore = true)
    @Mapping(target = "fundProfile", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    // Derived from the fund profile's tranche plan, never from the request.
    @Mapping(target = "totalGrantAmount", ignore = true)
    // Status and the approval block are applied by the service (they need
    // enum/date coercion and must not be silently defaulted by the mapper).
    @Mapping(target = "grantStatus", ignore = true)
    @Mapping(target = "isApproved", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvalDate", ignore = true)
    @Mapping(target = "approvalRemarks", ignore = true)
    GrantAgreement toEntity(CreateGrantRequest request);

    @Mapping(source = "grantStatus", target = "status")
    @Mapping(target = "approvedByName", ignore = true)
    @Mapping(source = "donor.id", target = "donorId")
    @Mapping(source = "donor.donorName", target = "donorName")
    @Mapping(source = "fundProfile.id", target = "fundProfileId")
    @Mapping(source = "fundProfile.fundClass", target = "fundClassCode")
    GrantDetailsResponse toDetailsResponse(GrantAgreement entity);

    @Mapping(source = "grantStatus", target = "status")
    @Mapping(source = "donor.donorName", target = "donorName")
    @Mapping(source = "fundProfile.id", target = "fundProfileId")
    @Mapping(source = "fundProfile.fundClass", target = "fundClassCode")
    GrantListResponse toListResponse(GrantAgreement entity);
}
