package com.ngo.finance.masters.budgetcategory.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.masters.budgetcategory.dto.request.CreateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.request.UpdateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.response.BudgetCategoryResponse;
import com.ngo.finance.masters.budgetcategory.entity.BudgetCategory;
import com.ngo.finance.masters.budgetcategory.mapper.BudgetCategoryMapper;
import com.ngo.finance.masters.budgetcategory.repository.BudgetCategoryRepository;
import com.ngo.finance.masters.budgetcategory.service.BudgetCategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Budget Category operations.
 *
 * <p>Names are unique regardless of case ("Travel" and "TRAVEL" clash) and
 * are tidied (trimmed, inner whitespace collapsed). Budget lines key off the
 * category's id, so renaming never breaks them.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BudgetCategoryServiceImpl implements BudgetCategoryService {

    private final BudgetCategoryRepository budgetCategoryRepository;

    private final BudgetCategoryMapper budgetCategoryMapper;

    @Override
    public BudgetCategoryResponse createBudgetCategory(CreateBudgetCategoryRequest request) {
        String name = normaliseName(request.getName());
        log.info("Registering new budget category: {}", name);

        if (name.isEmpty()) {
            throw new ValidationException("Category name is required");
        }
        if (budgetCategoryRepository.existsByNameIgnoreCase(name)) {
            throw new ValidationException("A budget category named '" + name + "' already exists");
        }

        BudgetCategory category = budgetCategoryMapper.toEntity(request);
        category.setName(name);
        category.setDescription(trimToNull(request.getDescription()));
        category.setStatus(request.getStatus() == null || request.getStatus());

        BudgetCategory saved = budgetCategoryRepository.save(category);
        log.info("Budget category registered successfully with id: {}", saved.getId());

        return budgetCategoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetCategoryResponse getBudgetCategoryById(Long id) {
        log.debug("Fetching budget category with id: {}", id);
        return budgetCategoryMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetCategoryResponse> getAllBudgetCategories() {
        log.debug("Fetching all budget categories");
        return budgetCategoryRepository.findAllByOrderByIdAsc().stream()
                .map(budgetCategoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetCategoryResponse> searchBudgetCategories(String searchTerm) {
        log.debug("Searching budget categories with term: {}", searchTerm);
        return budgetCategoryRepository.search(searchTerm.trim()).stream()
                .map(budgetCategoryMapper::toResponse)
                .toList();
    }

    @Override
    public BudgetCategoryResponse updateBudgetCategory(Long id, UpdateBudgetCategoryRequest request) {
        log.info("Updating budget category with id: {}", id);
        BudgetCategory category = findOrThrow(id);

        if (request.getName() != null) {
            String name = normaliseName(request.getName());
            if (name.isEmpty()) {
                throw new ValidationException("Category name is required");
            }
            if (budgetCategoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
                throw new ValidationException("A budget category named '" + name + "' already exists");
            }
            request.setName(name);
        }
        if (request.getDescription() != null) {
            request.setDescription(request.getDescription().trim());
        }

        budgetCategoryMapper.updateEntity(request, category);
        if (category.getDescription() != null && category.getDescription().isEmpty()) {
            category.setDescription(null);
        }

        BudgetCategory updated = budgetCategoryRepository.save(category);
        log.info("Budget category updated successfully");
        return budgetCategoryMapper.toResponse(updated);
    }

    @Override
    public void activateBudgetCategory(Long id) {
        log.info("Activating budget category with id: {}", id);
        BudgetCategory category = findOrThrow(id);
        category.setStatus(true);
        budgetCategoryRepository.save(category);
    }

    /**
     * Inactive categories stay on the budget lines that already use them;
     * the frontend just stops offering them for new lines.
     */
    @Override
    public void deactivateBudgetCategory(Long id) {
        log.info("Deactivating budget category with id: {}", id);
        BudgetCategory category = findOrThrow(id);
        category.setStatus(false);
        budgetCategoryRepository.save(category);
    }

    private BudgetCategory findOrThrow(Long id) {
        return budgetCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BudgetCategory", id));
    }

    private static String normaliseName(String name) {
        return name == null ? "" : name.trim().replaceAll("\\s+", " ");
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
