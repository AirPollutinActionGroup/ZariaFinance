package com.ngo.finance.programme.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.programme.ProgrammeStatuses;
import com.ngo.finance.programme.ProgrammeTypes;
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
 * Programme entity. A Project is a Programme row with type=Project and a
 * parentProgrammeId pointing at another Programme row (which must itself be
 * type=Programme) — there is no separate Project entity.
 */
@Entity
@Table(name = "programme")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Programme extends AuditEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String programmeCode;

    @Column(nullable = false, length = 255)
    private String programmeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = ProgrammeTypes.PROGRAMME;

    /** Set only when type is Project; the referenced Programme must itself be type=Programme. */
    @Column(name = "parent_programme_id")
    private Long parentProgrammeId;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "programme_state", joinColumns = @JoinColumn(name = "programme_id"))
    @Column(name = "state_id")
    @Builder.Default
    private Set<Long> stateIds = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "programme_city", joinColumns = @JoinColumn(name = "programme_id"))
    @Column(name = "city_id")
    @Builder.Default
    private Set<Long> cityIds = new HashSet<>();

    /** Lifecycle status; isActive is kept in sync with it (see ProgrammeStatuses). */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = ProgrammeStatuses.ACTIVE;
}
