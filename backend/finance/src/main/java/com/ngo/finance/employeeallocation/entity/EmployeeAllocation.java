package com.ngo.finance.employeeallocation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * One employee's time split against a Program and a Project — both are
 * Programme rows (see com.ngo.finance.programme.entity.Programme): programmeId
 * must reference a row with type=Programme, projectId must reference a row
 * with type=Project whose own parentProgrammeId equals programmeId.
 */
@Entity
@Table(name = "employee_allocation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EmployeeAllocation extends AuditEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "programme_id", nullable = false)
    private Long programmeId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(length = 255)
    private String role;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_allocation_state", joinColumns = @JoinColumn(name = "employee_allocation_id"))
    @Column(name = "state_id")
    @Builder.Default
    private Set<Long> stateIds = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_allocation_city", joinColumns = @JoinColumn(name = "employee_allocation_id"))
    @Column(name = "city_id")
    @Builder.Default
    private Set<Long> cityIds = new HashSet<>();

    @Column(name = "allocation_pct", nullable = false)
    private Integer allocationPct;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String remark;
}
