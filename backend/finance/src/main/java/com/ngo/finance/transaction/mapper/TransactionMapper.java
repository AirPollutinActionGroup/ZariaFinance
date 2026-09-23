package com.ngo.finance.transaction.mapper;

import com.ngo.finance.transaction.dto.request.CreateTransactionRequest;
import com.ngo.finance.transaction.dto.response.TransactionResponse;
import com.ngo.finance.transaction.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Transaction entity to/from DTOs.
 *
 * donorName / fundProfileLabel / grantCode / paymentModeName / groupName /
 * ledgerName are not on the entity — the service resolves them from the
 * referenced masters and sets them on the response afterwards.
 */
@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "transactionCode", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Transaction toEntity(CreateTransactionRequest request);

    @Mapping(target = "donorName", ignore = true)
    @Mapping(target = "fundProfileLabel", ignore = true)
    @Mapping(target = "grantCode", ignore = true)
    @Mapping(target = "paymentModeName", ignore = true)
    @Mapping(target = "groupName", ignore = true)
    @Mapping(target = "ledgerName", ignore = true)
    @Mapping(target = "bankAccountLabel", ignore = true)
    TransactionResponse toResponse(Transaction entity);
}
