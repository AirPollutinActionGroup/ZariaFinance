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
    @Mapping(target = "programme", ignore = true)
    @Mapping(target = "rules", ignore = true)
    @Mapping(target = "reporting", ignore = true)
    @Mapping(target = "tranches", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "budgetHeads", ignore = true)
    @Mapping(target = "kpis", ignore = true)
    @Mapping(target = "geographies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "grantStatus", ignore = true)
    GrantAgreement toEntity(CreateGrantRequest request);

    @Mapping(source = "donor.id", target = "donorId")
    @Mapping(source = "donor.donorName", target = "donorName")
    @Mapping(source = "programme.id", target = "programmeId")
    @Mapping(source = "programme.programmeName", target = "programmeName")
    GrantDetailsResponse toDetailsResponse(GrantAgreement entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "donor.donorName", target = "donorName")
    @Mapping(source = "programme.programmeName", target = "programmeName")
    GrantListResponse toListResponse(GrantAgreement entity);
}
