package com.ngo.finance.bankDetails.mapper;

import com.ngo.finance.bankDetails.dto.request.CreateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.request.UpdateBankDetailRequest;
import com.ngo.finance.bankDetails.dto.response.BankDetailResponse;
import com.ngo.finance.bankDetails.entity.BankDetail;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for BankDetail entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface BankDetailMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    BankDetail toEntity(CreateBankDetailRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    BankDetailResponse toResponse(BankDetail entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateBankDetailRequest request, @MappingTarget BankDetail entity);
}
