package com.ngo.finance.donor.mapper;

import com.ngo.finance.donor.dto.response.DocumentResponse;
import com.ngo.finance.donor.entity.GrantDocument;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for Grant Document entity to DTOs
 */
@Mapper(componentModel = "spring")
public interface DocumentMapper {

    DocumentResponse toResponse(GrantDocument entity);
}
