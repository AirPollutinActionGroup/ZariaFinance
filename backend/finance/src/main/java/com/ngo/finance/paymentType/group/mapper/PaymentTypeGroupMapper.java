package com.ngo.finance.paymentType.group.mapper;

import com.ngo.finance.paymentType.group.dto.request.CreatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.request.UpdatePaymentTypeGroupRequest;
import com.ngo.finance.paymentType.group.dto.response.PaymentTypeGroupResponse;
import com.ngo.finance.paymentType.group.entity.PaymentTypeGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for PaymentTypeGroup entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface PaymentTypeGroupMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    PaymentTypeGroup toEntity(CreatePaymentTypeGroupRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    PaymentTypeGroupResponse toResponse(PaymentTypeGroup entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdatePaymentTypeGroupRequest request, @MappingTarget PaymentTypeGroup entity);
}
