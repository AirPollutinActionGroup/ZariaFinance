package com.ngo.finance.outflow.service;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.outflow.dto.RefDto;
import com.ngo.finance.outflow.dto.request.CreateDebitNoteRequest;
import com.ngo.finance.outflow.dto.response.NoteResponse;
import com.ngo.finance.outflow.entity.DebitNote;
import com.ngo.finance.outflow.mapper.NoteMapper;
import com.ngo.finance.outflow.repository.DebitNoteRepository;
import com.ngo.finance.outflow.service.OutflowScheduleService.OutflowRow;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Debit notes: every debit (out) payment against an outflow row. Each note
 * adds to the row's Spent. A note charged to a donor fund can't be for more
 * than the fund has available: received (its credit notes) − already debited.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DebitNoteService {

    private static final NumberFormat INR = NumberFormat.getNumberInstance(Locale.of("en", "IN"));

    private final DebitNoteRepository debitNoteRepository;

    private final FundBalanceService fundBalanceService;

    private final OutflowScheduleService outflowScheduleService;

    private final NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public List<NoteResponse> listDebitNotes() {
        return debitNoteRepository.findAllByOrderByNoteDateDescIdDesc().stream().map(noteMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse getDebitNote(String code) {
        return noteMapper.toResponse(findOrThrow(code));
    }

    public NoteResponse createDebitNote(CreateDebitNoteRequest request) {
        OutflowRow row = NoteRules.resolveRowForNote(outflowScheduleService, request.getOutflowLineId());

        // Over budget after this note → the reason is required (as on the form).
        BigDecimal remainingAfter = row.expectedAmount()
                .subtract(outflowScheduleService.spentOn(row))
                .subtract(request.getAmount());
        String reason = NoteRules.trimToNull(request.getReason());
        if (remainingAfter.signum() < 0 && reason == null) {
            throw new ValidationException("This note takes " + row.id() + " over budget — give an over-budget reason");
        }
        NoteRules.requirePicked(request.getPayee(), "Select the payee");
        NoteRules.requirePicked(request.getPaymentMode(), "Select a payment mode");
        NoteRules.requirePicked(request.getGroup(), "Select a payment group");
        NoteRules.requireDonorForFund(request.getDonor(), request.getFundProfile());
        requireFundBalance(request);

        String actor = NoteRules.actor(request.getActor());
        DebitNote note = DebitNote.builder()
                .noteCode(nextCode(request.getDate().getYear()))
                .budgetLine(row.line())
                .quarter((short) row.quarter())
                .noteDate(request.getDate())
                .amount(request.getAmount())
                .reason(remainingAfter.signum() < 0 ? reason : null)
                .book(request.getBook())
                .payeeCategory(request.getPayeeCategory().trim())
                .payeeRef(RefDto.idOf(request.getPayee()))
                .payeeName(RefDto.nameOf(request.getPayee()))
                .paymentModeRef(RefDto.idOf(request.getPaymentMode()))
                .paymentModeName(RefDto.nameOf(request.getPaymentMode()))
                .bankAccountRef(RefDto.idOf(request.getBankAccount()))
                .bankAccountName(RefDto.nameOf(request.getBankAccount()))
                .groupRef(RefDto.idOf(request.getGroup()))
                .groupName(RefDto.nameOf(request.getGroup()))
                .ledgerRef(RefDto.idOf(request.getLedger()))
                .ledgerName(RefDto.nameOf(request.getLedger()))
                .donorRef(RefDto.idOf(request.getDonor()))
                .donorName(RefDto.nameOf(request.getDonor()))
                .fundProfileRef(RefDto.idOf(request.getFundProfile()))
                .fundProfileName(RefDto.nameOf(request.getFundProfile()))
                .grantRef(RefDto.idOf(request.getGrant()))
                .grantName(RefDto.nameOf(request.getGrant()))
                .reference(NoteRules.trimToNull(request.getReference()))
                .remarks(NoteRules.trimToNull(request.getRemarks()))
                .attachmentName(NoteRules.trimToNull(request.getAttachmentName()))
                .build();
        note.setCreatedBy(actor);
        note.setUpdatedBy(actor);

        DebitNote saved = debitNoteRepository.save(note);
        log.info("Debit note {} issued on {} for {}", saved.getNoteCode(), row.id(), saved.getAmount());
        return noteMapper.toResponse(saved);
    }

    /** A debit charged to a fund may not exceed what the fund has available. */
    private void requireFundBalance(CreateDebitNoteRequest request) {
        String fundRef = RefDto.idOf(request.getFundProfile());
        if (fundRef == null) {
            return;
        }
        BigDecimal available = fundBalanceService.balanceOf(fundRef).available();
        if (request.getAmount().compareTo(available) > 0) {
            String fund = RefDto.nameOf(request.getFundProfile());
            throw new ValidationException(available.signum() > 0
                    ? "Only ₹" + INR.format(available) + " is available on " + fund + " — the debit can't be more than that"
                    : fund + " has no balance available — nothing has been received into it yet, or it's fully used");
        }
    }

    private DebitNote findOrThrow(String code) {
        return debitNoteRepository.findByNoteCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Debit note " + code + " not found"));
    }

    /** DN-{year}-{nnn}, one sequence per calendar year of the note date. */
    private String nextCode(int year) {
        String prefix = "DN-" + year + "-";
        int next = debitNoteRepository.findTopByNoteCodeStartingWithOrderByNoteCodeDesc(prefix)
                .map(n -> Integer.parseInt(n.getNoteCode().substring(prefix.length())) + 1)
                .orElse(1);
        return prefix + String.format("%03d", next);
    }
}
