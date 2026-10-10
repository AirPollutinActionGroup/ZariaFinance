package com.ngo.finance.masters.budgetcategory.mapper;

import com.ngo.finance.masters.budgetcategory.dto.request.CreateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.request.UpdateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.response.BudgetCategoryResponse;
import com.ngo.finance.masters.budgetcategory.entity.BudgetCategory;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for BudgetCategory entity to/from DTOs. Status is set by
 * the service (defaulting / activate / deactivate), never here.
 */
@Mapper(componentModel = "spring")
public interface BudgetCategoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    BudgetCategory toEntity(CreateBudgetCategoryRequest request);

    @Mapping(target = "status", expression = "java(Boolean.TRUE.equals(entity.getStatus()) ? \"ACTIVE\" : \"INACTIVE\")")
    BudgetCategoryResponse toResponse(BudgetCategory entity);

    /** Partial update: null request fields leave the entity untouched. */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(UpdateBudgetCategoryRequest request, @MappingTarget BudgetCategory entity);
}
