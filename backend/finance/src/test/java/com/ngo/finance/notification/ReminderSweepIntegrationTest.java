package com.ngo.finance.notification;

import static org.assertj.core.api.Assertions.assertThat;

import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.GrantCriteriaReminder;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.entity.GrantTrancheCriterion;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.ResponsibleRole;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.donor.repository.GrantTrancheRepository;
import com.ngo.finance.notification.dto.NotificationResponse;
import com.ngo.finance.notification.dto.RoleDirectoryEntryDto;
import com.ngo.finance.notification.repository.NotificationRepository;
import com.ngo.finance.notification.service.NotificationService;
import com.ngo.finance.notification.service.ReminderSweepService;
import com.ngo.finance.notification.service.RoleDirectoryService;
import com.ngo.finance.userRegister.entity.UserRegister;
import com.ngo.finance.userRegister.repository.UserRegisterRepo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Limit;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * The reminder sweep: when a reminder fires, who it reaches, and that running it
 * twice cannot double-notify.
 *
 * Not @Transactional at class level — {@code deliver} runs in its own transaction
 * (REQUIRES_NEW), which a rolled-back test transaction would not see. @AfterEach
 * removes everything seeded so the database is left as found.
 */
@SpringBootTest
public class ReminderSweepIntegrationTest {

    @Autowired
    private ReminderSweepService reminderSweepService;

    @Autowired
    private RoleDirectoryService roleDirectoryService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private DonorFundProfileRepository fundProfileRepository;

    @Autowired
    private GrantRepository grantRepository;

    @Autowired
    private GrantTrancheRepository trancheRepository;

    @Autowired
    private UserRegisterRepo userRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    /**
     * Per-run token. These tests commit for real (the sweep's deliveries run in
     * their own transaction, which a rolled-back test transaction could not see),
     * so seeded codes must not collide with a previous run's rows.
     */
    private final String run = Long.toString(System.nanoTime() % 100_000L);

    private final List<Long> seededTrancheIds = new ArrayList<>();
    private final List<Long> seededGrantIds = new ArrayList<>();
    private final List<Long> seededProfileIds = new ArrayList<>();
    private final List<Long> seededDonorIds = new ArrayList<>();
    private final List<Long> seededUserIds = new ArrayList<>();

    /** Everything committed above is removed so the database is left as found. */
    @AfterEach
    void cleanUpSeededData() {
        transactionTemplate.executeWithoutResult(status -> {
            seededUserIds.forEach(this::deleteNotificationsFor);
            seededTrancheIds.forEach(id -> trancheRepository.findById(id)
                    .ifPresent(trancheRepository::delete));
            seededGrantIds.forEach(id -> grantRepository.findById(id)
                    .ifPresent(grantRepository::delete));
            seededProfileIds.forEach(id -> fundProfileRepository.findById(id)
                    .ifPresent(fundProfileRepository::delete));
            seededDonorIds.forEach(id -> donorRepository.findById(id)
                    .ifPresent(donorRepository::delete));
            roleDirectoryService.updateDirectory(
                    List.of(RoleDirectoryEntryDto.builder().role(ResponsibleRole.CFO).build(),
                            RoleDirectoryEntryDto.builder().role(ResponsibleRole.ACCOUNTS).build(),
                            RoleDirectoryEntryDto.builder().role(ResponsibleRole.PROGRAMME_MANAGER).build(),
                            RoleDirectoryEntryDto.builder().role(ResponsibleRole.HEAD_OF_ORGANISATION).build()));
            seededUserIds.forEach(id -> userRepository.findById(id).ifPresent(userRepository::delete));
        });
    }

    /** A grant with one tranche expected on 2027-03-01 carrying one unmet criterion. */
    private GrantTranche seedTrancheWithReminder(String suffix, ResponsibleRole role,
            RepeatReminder repeat, int leadDays, boolean escalate) {
        DonorMaster donor = donorRepository.save(DonorMaster.builder()
                .donorCode("DN-REM-" + run + suffix)
                .donorName("Reminder Donor " + run + suffix)
                .donorType(DonorType.CORPORATE)
                .email("rem" + run + suffix + "@example.com")
                .spocNameOfThePerson("POC")
                .spocEmail("poc-rem-" + run + suffix + "@example.com")
                .isActive(true)
                .build());
        seededDonorIds.add(donor.getId());

        DonorFundProfile profile = fundProfileRepository.save(DonorFundProfile.builder()
                .donor(donor)
                .fundMode(FundMode.RESTRICTED)
                .fundClass(FundClass.CLASS_A_RESTRICTED)
                .purpose("Reminder test")
                .build());
        seededProfileIds.add(profile.getId());

        GrantAgreement grant = grantRepository.save(GrantAgreement.builder()
                .grantCode("GR-REM-" + run + suffix)
                .donor(donor)
                .fundProfile(profile)
                .agreementName("Reminder Grant " + suffix)
                .agreementDate(LocalDate.of(2026, 1, 1))
                .startDate(LocalDate.of(2026, 1, 2))
                .endDate(LocalDate.of(2027, 12, 31))
                .totalGrantAmount(new BigDecimal("100000.00"))
                .grantStatus(GrantStatus.ACTIVE)
                .build());

        GrantTranche tranche = GrantTranche.builder()
                .grant(grant)
                .trancheNumber(1)
                .trancheName("Only")
                .trancheAmount(new BigDecimal("100000.00"))
                .plannedReleaseDate(LocalDate.of(2027, 3, 1))
                .trancheStatus("PENDING")
                .build();

        GrantTrancheCriterion criterion = GrantTrancheCriterion.builder()
                .tranche(tranche)
                .sequence(1)
                .criterionType(CriterionType.UTILISATION_CERTIFICATE)
                .met(false)
                .build();
        criterion.setReminder(GrantCriteriaReminder.builder()
                .criterion(criterion)
                .responsibleRole(role)
                .reminderLeadDays(leadDays)
                .repeatReminder(repeat)
                .escalateToDeputy(escalate)
                .build());
        tranche.getCriteria().add(criterion);

        GrantTranche saved = trancheRepository.save(tranche);
        seededGrantIds.add(grant.getId());
        seededTrancheIds.add(saved.getId());
        return saved;
    }

    private UserRegister seedUser(String suffix, String first) {
        UserRegister user = new UserRegister();
        user.setFirstName(first);
        user.setLastName("Tester");
        user.setEmailId("rem-" + run + suffix + "@example.com");
        // mobile_no is unique and exactly 10 digits.
        user.setMobileNo(("9" + run + suffix + "000000000").substring(0, 10));
        user.setUsername("remuser" + run + suffix);
        // users.password_length requires 4–100 characters.
        user.setPassword("test-password-not-used");
        user.setRole("USER");
        user.setIsApproved(1);
        user.setStatus(true);
        UserRegister saved = userRepository.save(user);
        seededUserIds.add(saved.getId());
        return saved;
    }

    private void assign(ResponsibleRole role, Long primaryId, Long deputyId) {
        roleDirectoryService.updateDirectory(List.of(RoleDirectoryEntryDto.builder()
                .role(role).primaryUserId(primaryId).deputyUserId(deputyId).build()));
    }

    @Test
    void testFiresOnTheDueDateOnlyForAOnceReminder() {
        GrantTranche tranche = seedTrancheWithReminder("01", ResponsibleRole.CFO,
                RepeatReminder.ONCE, 10, false);
        UserRegister holder = seedUser("01", "Once");
        assign(ResponsibleRole.CFO, holder.getId(), null);

        // Expected release 2027-03-01 with a 10-day lead → due 2027-02-19.
        reminderSweepService.sweep(LocalDate.of(2027, 2, 18));
        assertThat(inboxOf(holder)).isEmpty();
        reminderSweepService.sweep(LocalDate.of(2027, 2, 19));
        assertThat(inboxOf(holder)).hasSize(1);
        // ONCE does not repeat.
        reminderSweepService.sweep(LocalDate.of(2027, 2, 20));
        assertThat(inboxOf(holder)).hasSize(1);

        List<NotificationResponse> inbox = inboxOf(holder);
        assertThat(inbox.get(0).getTitle()).contains("Utilisation Certificate (UC)");
        assertThat(inbox.get(0).getLink())
                .isEqualTo("/grants/" + tranche.getGrant().getId() + "/disbursement");
        assertThat(inbox.get(0).getEscalation()).isFalse();
    }

    @Test
    void testRepeatingReminderFiresOnTheCadenceAndKeepsGoingWhenOverdue() {
        seedTrancheWithReminder("02", ResponsibleRole.ACCOUNTS, RepeatReminder.WEEKLY, 7, false);
        UserRegister holder = seedUser("02", "Weekly");
        assign(ResponsibleRole.ACCOUNTS, holder.getId(), null);

        // Due 2027-02-22; weekly thereafter, including past the release date —
        // an overdue sign-off is exactly when chasing matters.
        reminderSweepService.sweep(LocalDate.of(2027, 2, 22));
        assertThat(inboxOf(holder)).hasSize(1);
        reminderSweepService.sweep(LocalDate.of(2027, 2, 23));
        assertThat(inboxOf(holder)).hasSize(1);
        reminderSweepService.sweep(LocalDate.of(2027, 3, 1));
        assertThat(inboxOf(holder)).hasSize(2);
        reminderSweepService.sweep(LocalDate.of(2027, 3, 8));
        assertThat(inboxOf(holder)).hasSize(3);
    }

    @Test
    void testSweepIsIdempotentWhenRunTwiceForTheSameDay() {
        seedTrancheWithReminder("03", ResponsibleRole.CFO, RepeatReminder.ONCE, 5, false);
        UserRegister holder = seedUser("03", "Idempotent");
        assign(ResponsibleRole.CFO, holder.getId(), null);

        LocalDate due = LocalDate.of(2027, 2, 24);
        assertThat(reminderSweepService.sweep(due)).isEqualTo(1);
        // A restart, a manual re-run or a second instance must not double-notify.
        assertThat(reminderSweepService.sweep(due)).isZero();
        assertThat(reminderSweepService.sweep(due)).isZero();
        assertThat(inboxOf(holder)).hasSize(1);
    }

    @Test
    void testDeputyIsCopiedInButTheActionStaysWithTheHolder() {
        seedTrancheWithReminder("04", ResponsibleRole.HEAD_OF_ORGANISATION,
                RepeatReminder.ONCE, 3, true);
        UserRegister holder = seedUser("04", "Holder");
        UserRegister deputy = seedUser("05", "Deputy");
        assign(ResponsibleRole.HEAD_OF_ORGANISATION, holder.getId(), deputy.getId());

        reminderSweepService.sweep(LocalDate.of(2027, 2, 26));
        assertThat(inboxOf(holder)).hasSize(1);
        assertThat(inboxOf(deputy)).hasSize(1);

        NotificationResponse deputyCopy = inboxOf(deputy).get(0);
        assertThat(deputyCopy.getEscalation()).isTrue();
        assertThat(deputyCopy.getCategory()).isEqualTo("ESCALATION");
        // The wording must not imply the deputy may approve in their place.
        assertThat(deputyCopy.getBody()).contains("the action remains with");
    }

    @Test
    void testNoNotificationWhenTheRoleHasNoHolder() {
        seedTrancheWithReminder("06", ResponsibleRole.PROGRAMME_MANAGER,
                RepeatReminder.ONCE, 1, true);
        assign(ResponsibleRole.PROGRAMME_MANAGER, null, null);

        // Nowhere to send it: the sweep logs and moves on rather than failing.
        assertThat(reminderSweepService.sweep(LocalDate.of(2027, 2, 28))).isZero();
        assertThat(notificationRepository.count()).isZero();
    }

    @Test
    void testMetCriterionAndReceivedTrancheAreNotChased() {
        GrantTranche met = seedTrancheWithReminder("07", ResponsibleRole.CFO,
                RepeatReminder.ONCE, 10, false);
        GrantTranche received = seedTrancheWithReminder("08", ResponsibleRole.CFO,
                RepeatReminder.ONCE, 10, false);
        UserRegister holder = seedUser("07", "Quiet");
        assign(ResponsibleRole.CFO, holder.getId(), null);

        markCriterionMet(met.getId());
        markReceived(received.getId());

        reminderSweepService.sweep(LocalDate.of(2027, 2, 19));
        assertThat(inboxOf(holder)).isEmpty();
    }

    /**
     * Uses TransactionTemplate rather than @Transactional: these are called from
     * within the same class, and self-invocation bypasses the proxy — the lazy
     * criteria collection would then fail to load.
     */
    private void markCriterionMet(Long trancheId) {
        transactionTemplate.executeWithoutResult(status -> {
            GrantTranche tranche = trancheRepository.findById(trancheId).orElseThrow();
            tranche.getCriteria().forEach(c -> c.setMet(true));
            trancheRepository.save(tranche);
        });
    }

    private void markReceived(Long trancheId) {
        transactionTemplate.executeWithoutResult(status -> {
            GrantTranche tranche = trancheRepository.findById(trancheId).orElseThrow();
            tranche.setActualAmount(new BigDecimal("100000.00"));
            tranche.setActualReleaseDate(LocalDate.of(2027, 3, 2));
            trancheRepository.save(tranche);
        });
    }

    /**
     * Asserting on this user's inbox rather than the sweep's return value: the
     * sweep is global, so its count also reflects any other grant in the database.
     */
    private List<NotificationResponse> inboxOf(UserRegister user) {
        return notificationService.list(user.getId(), false, 20);
    }

    private void deleteNotificationsFor(Long userId) {
        notificationRepository.deleteAll(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Limit.of(100)));
    }
}
