package com.ngo.finance.transaction.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.paymentMode.entity.PaymentMode;
import com.ngo.finance.paymentMode.repository.PaymentModeRepository;
import com.ngo.finance.paymentType.group.entity.PaymentTypeGroup;
import com.ngo.finance.paymentType.group.repository.PaymentTypeGroupRepository;
import com.ngo.finance.paymentType.ledger.entity.PaymentTypeLedger;
import com.ngo.finance.paymentType.ledger.repository.PaymentTypeLedgerRepository;
import com.ngo.finance.transaction.dto.request.CreateTransactionRequest;
import com.ngo.finance.transaction.dto.response.TransactionResponse;
import com.ngo.finance.transaction.entity.Transaction;
import com.ngo.finance.transaction.mapper.TransactionMapper;
import com.ngo.finance.transaction.repository.TransactionRepository;
import com.ngo.finance.transaction.service.TransactionService;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Transaction operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private static final String TRANSACTION_CODE_PREFIX = "ZAR-";

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    private final DonorRepository donorRepository;
    private final DonorFundProfileRepository fundProfileRepository;
    private final GrantRepository grantRepository;
    private final PaymentModeRepository paymentModeRepository;
    private final PaymentTypeGroupRepository groupRepository;
    private final PaymentTypeLedgerRepository ledgerRepository;

    @Override
    public TransactionResponse createTransaction(CreateTransactionRequest request) {
        log.info("Recording new {} transaction for amount {}", request.getType(), request.getAmount());

        DonorMaster donor = donorRepository.findById(request.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor", request.getDonorId()));
        DonorFundProfile fundProfile = fundProfileRepository.findById(request.getFundProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("FundProfile", request.getFundProfileId()));
        GrantAgreement grant = null;
        if (request.getGrantId() != null) {
            grant = grantRepository.findById(request.getGrantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grant", request.getGrantId()));
        }
        PaymentMode paymentMode = paymentModeRepository.findById(request.getPaymentModeId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentMode", request.getPaymentModeId()));
        PaymentTypeGroup group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", request.getGroupId()));
        PaymentTypeLedger ledger = ledgerRepository.findById(request.getLedgerId())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTypeLedger", request.getLedgerId()));

        Transaction transaction = transactionMapper.toEntity(request);
        transaction.setTransactionCode(generateTransactionCode());

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction {} recorded successfully with id: {}", saved.getTransactionCode(), saved.getId());

        return toResponse(saved, donor, fundProfile, grant, paymentMode, group, ledger);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionByCode(String transactionCode) {
        log.debug("Fetching transaction with code: {}", transactionCode);
        Transaction transaction = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "code", transactionCode));

        DonorMaster donor = requireDonor(transaction.getDonorId());
        DonorFundProfile fundProfile = requireFundProfile(transaction.getFundProfileId());
        GrantAgreement grant = transaction.getGrantId() != null
                ? grantRepository.findById(transaction.getGrantId()).orElse(null)
                : null;
        PaymentMode paymentMode = requirePaymentMode(transaction.getPaymentModeId());
        PaymentTypeGroup group = requireGroup(transaction.getGroupId());
        PaymentTypeLedger ledger = requireLedger(transaction.getLedgerId());

        return toResponse(transaction, donor, fundProfile, grant, paymentMode, group, ledger);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        log.debug("Fetching all transactions");
        List<Transaction> transactions = transactionRepository.findAllByOrderByTransactionDateDescIdDesc();

        Map<Long, DonorMaster> donorsById = donorRepository
                .findAllById(transactions.stream().map(Transaction::getDonorId).distinct().toList())
                .stream().collect(Collectors.toMap(DonorMaster::getId, Function.identity()));

        Map<Long, DonorFundProfile> fundProfilesById = fundProfileRepository
                .findAllById(transactions.stream().map(Transaction::getFundProfileId).distinct().toList())
                .stream().collect(Collectors.toMap(DonorFundProfile::getId, Function.identity()));

        List<Long> grantIds = transactions.stream().map(Transaction::getGrantId).filter(java.util.Objects::nonNull)
                .distinct().toList();
        Map<Long, GrantAgreement> grantsById = grantRepository.findAllById(grantIds).stream()
                .collect(Collectors.toMap(GrantAgreement::getId, Function.identity()));

        Map<Long, PaymentMode> paymentModesById = paymentModeRepository
                .findAllById(transactions.stream().map(Transaction::getPaymentModeId).distinct().toList())
                .stream().collect(Collectors.toMap(PaymentMode::getId, Function.identity()));

        Map<Long, PaymentTypeGroup> groupsById = groupRepository
                .findAllById(transactions.stream().map(Transaction::getGroupId).distinct().toList())
                .stream().collect(Collectors.toMap(PaymentTypeGroup::getId, Function.identity()));

        Map<Long, PaymentTypeLedger> ledgersById = ledgerRepository
                .findAllById(transactions.stream().map(Transaction::getLedgerId).distinct().toList())
                .stream().collect(Collectors.toMap(PaymentTypeLedger::getId, Function.identity()));

        return transactions.stream()
                .map(t -> toResponse(
                        t,
                        donorsById.get(t.getDonorId()),
                        fundProfilesById.get(t.getFundProfileId()),
                        t.getGrantId() != null ? grantsById.get(t.getGrantId()) : null,
                        paymentModesById.get(t.getPaymentModeId()),
                        groupsById.get(t.getGroupId()),
                        ledgersById.get(t.getLedgerId())))
                .toList();
    }

    private DonorMaster requireDonor(Long id) {
        return donorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Donor", id));
    }

    private DonorFundProfile requireFundProfile(Long id) {
        return fundProfileRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("FundProfile", id));
    }

    private PaymentMode requirePaymentMode(Long id) {
        return paymentModeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PaymentMode", id));
    }

    private PaymentTypeGroup requireGroup(Long id) {
        return groupRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PaymentTypeGroup", id));
    }

    private PaymentTypeLedger requireLedger(Long id) {
        return ledgerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PaymentTypeLedger", id));
    }

    private TransactionResponse toResponse(
            Transaction transaction,
            DonorMaster donor,
            DonorFundProfile fundProfile,
            GrantAgreement grant,
            PaymentMode paymentMode,
            PaymentTypeGroup group,
            PaymentTypeLedger ledger) {
        TransactionResponse response = transactionMapper.toResponse(transaction);
        response.setDonorName(donor != null ? donor.getDonorName() : null);
        response.setFundProfileLabel(fundProfile != null ? fundProfileLabel(fundProfile) : null);
        response.setGrantCode(grant != null ? grant.getGrantCode() : null);
        response.setPaymentModeName(paymentMode != null ? paymentMode.getName() : null);
        response.setGroupName(group != null ? group.getName() : null);
        response.setLedgerName(ledger != null ? ledger.getName() : null);
        return response;
    }

    private String fundProfileLabel(DonorFundProfile fundProfile) {
        return (fundProfile.getPurpose() != null && !fundProfile.getPurpose().isBlank())
                ? fundProfile.getPurpose()
                : "Fund profile #" + fundProfile.getId();
    }

    /** Sequential ZAR-000001 style code — no external gaps expected at this scale. */
    private String generateTransactionCode() {
        long next = transactionRepository.count() + 1;
        return String.format("%s%06d", TRANSACTION_CODE_PREFIX, next);
    }
}
