package com.ngo.finance.outflow.service;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.outflow.dto.RefDto;
import com.ngo.finance.outflow.dto.request.CreateCreditNoteRequest;
import com.ngo.finance.outflow.dto.response.NoteResponse;
import com.ngo.finance.outflow.entity.CreditNote;
import com.ngo.finance.outflow.mapper.NoteMapper;
import com.ngo.finance.outflow.repository.CreditNoteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Credit notes: money that came back, optionally returned to a donor fund.
 * They aren't tied to an outflow row or a debit note, so they don't change Spent.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CreditNoteService {

    private final CreditNoteRepository creditNoteRepository;

    private final NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public List<NoteResponse> listCreditNotes() {
        return creditNoteRepository.findAllByOrderByNoteDateDescIdDesc().stream().map(noteMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse getCreditNote(String code) {
        return noteMapper.toResponse(findOrThrow(code));
    }

    public NoteResponse createCreditNote(CreateCreditNoteRequest request) {
        NoteRules.requirePicked(request.getPaymentMode(), "Select how the money was received");
        NoteRules.requireDonorForFund(request.getDonor(), request.getFundProfile());
        boolean hasFund = RefDto.nameOf(request.getFundProfile()) != null;

        String actor = NoteRules.actor(request.getActor());
        CreditNote note = CreditNote.builder()
                .noteCode(nextCode(request.getDate().getYear()))
                .noteDate(request.getDate())
                .amount(request.getAmount())
                .book(request.getBook())
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
                // Disbursement rule and tranche only make sense with a fund.
                .disbursementType(hasFund ? NoteRules.trimToNull(request.getDisbursementType()) : null)
                .trancheRef(hasFund ? RefDto.idOf(request.getTranche()) : null)
                .trancheName(hasFund ? RefDto.nameOf(request.getTranche()) : null)
                .reference(NoteRules.trimToNull(request.getReference()))
                .remarks(NoteRules.trimToNull(request.getRemarks()))
                .attachmentName(NoteRules.trimToNull(request.getAttachmentName()))
                .build();
        note.setCreatedBy(actor);
        note.setUpdatedBy(actor);

        CreditNote saved = creditNoteRepository.save(note);
        log.info("Credit note {} issued for {}", saved.getNoteCode(), saved.getAmount());
        return noteMapper.toResponse(saved);
    }

    private CreditNote findOrThrow(String code) {
        return creditNoteRepository.findByNoteCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Credit note " + code + " not found"));
    }

    /** CN-{year}-{nnn}, one sequence per calendar year of the note date. */
    private String nextCode(int year) {
        String prefix = "CN-" + year + "-";
        int next = creditNoteRepository.findTopByNoteCodeStartingWithOrderByNoteCodeDesc(prefix)
                .map(n -> Integer.parseInt(n.getNoteCode().substring(prefix.length())) + 1)
                .orElse(1);
        return prefix + String.format("%03d", next);
    }
}
