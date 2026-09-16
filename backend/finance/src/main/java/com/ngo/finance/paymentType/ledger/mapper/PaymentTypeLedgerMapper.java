package com.ngo.finance.paymentType.ledger.mapper;

import com.ngo.finance.paymentType.ledger.dto.request.CreatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.request.UpdatePaymentTypeLedgerRequest;
import com.ngo.finance.paymentType.ledger.dto.response.PaymentTypeLedgerResponse;
import com.ngo.finance.paymentType.ledger.entity.PaymentTypeLedger;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for PaymentTypeLedger entity to/from DTOs.
 *
 * groupName is not on the entity — it's resolved by the service layer
 * from the referenced PaymentTypeGroup and set on the response afterwards.
 */
@Mapper(componentModel = "spring")
public interface PaymentTypeLedgerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    PaymentTypeLedger toEntity(CreatePaymentTypeLedgerRequest request);

    @Mapping(target = "groupName", ignore = true)
    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    PaymentTypeLedgerResponse toResponse(PaymentTypeLedger entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdatePaymentTypeLedgerRequest request, @MappingTarget PaymentTypeLedger entity);
}
