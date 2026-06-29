package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.request.CreateDonorContactRequest;
import com.ngo.finance.donor.dto.response.DonorContactResponse;
import com.ngo.finance.donor.entity.DonorContact;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for DonorContact entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface DonorContactMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "donor", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "isPrimary", ignore = true)
    DonorContact toEntity(CreateDonorContactRequest request);

    DonorContactResponse toResponse(DonorContact entity);
}
