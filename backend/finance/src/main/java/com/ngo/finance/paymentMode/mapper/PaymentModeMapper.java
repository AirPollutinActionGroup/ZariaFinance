package com.ngo.finance.paymentMode.mapper;

import com.ngo.finance.paymentMode.dto.request.CreatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.request.UpdatePaymentModeRequest;
import com.ngo.finance.paymentMode.dto.response.PaymentModeResponse;
import com.ngo.finance.paymentMode.entity.PaymentMode;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for PaymentMode entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface PaymentModeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    PaymentMode toEntity(CreatePaymentModeRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    PaymentModeResponse toResponse(PaymentMode entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdatePaymentModeRequest request, @MappingTarget PaymentMode entity);
}
