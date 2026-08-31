package com.ngo.finance.vendorRegister.mapper;

import com.ngo.finance.vendorRegister.dto.request.CreateVendorRequest;
import com.ngo.finance.vendorRegister.dto.response.VendorResponse;
import com.ngo.finance.vendorRegister.entity.VendorRegister;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for VendorRegister entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface VendorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "vendorCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    VendorRegister toEntity(CreateVendorRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    VendorResponse toResponse(VendorRegister entity);
}
