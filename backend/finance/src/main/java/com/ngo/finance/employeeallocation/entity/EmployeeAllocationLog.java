package com.ngo.finance.employeeallocation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.employeeallocation.enums.AllocationEvent;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One event in an employee's allocation history. Names are copied at the
 * time of the event so the row still reads correctly after the allocation
 * is deleted or a programme is renamed. Rows are only ever added.
 */
@Entity
@Table(name = "employee_allocation_log")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAllocationLog extends AuditEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "allocation_id", nullable = false)
    private Long allocationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AllocationEvent event;

    @Column(name = "programme_id")
    private Long programmeId;

    @Column(name = "programme_name", length = 255)
    private String programmeName;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_name", length = 255)
    private String projectName;

    @Column(length = 255)
    private String role;

    @Column(name = "allocation_pct", nullable = false)
    private Integer allocationPct;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "state_names", columnDefinition = "TEXT")
    private String stateNames;

    @Column(name = "city_names", columnDefinition = "TEXT")
    private String cityNames;

    @Column(columnDefinition = "TEXT")
    private String note;
}
