package com.ngo.finance.financialYear.mapper;

import com.ngo.finance.financialYear.dto.request.CreateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.request.UpdateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.response.FinancialYearResponse;
import com.ngo.finance.financialYear.entity.FinancialYear;
import java.time.LocalDate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for FinancialYear entity to/from DTOs
 */
@Mapper(componentModel = "spring")
public interface FinancialYearMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "current", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    FinancialYear toEntity(CreateFinancialYearRequest request);

    @Mapping(target = "status", expression = "java(resolveStatus(entity.getStartDate(), entity.getEndDate()))")
    FinancialYearResponse toResponse(FinancialYear entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "current", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateFinancialYearRequest request, @MappingTarget FinancialYear entity);

    default String resolveStatus(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        if (endDate.isBefore(today)) {
            return "CLOSED";
        }
        if (startDate.isAfter(today)) {
            return "UPCOMING";
        }
        return "ACTIVE";
    }
}
