package com.ngo.finance.outflow.mapper;

import com.ngo.finance.budget.entity.BudgetLine;
import com.ngo.finance.outflow.dto.RefDto;
import com.ngo.finance.outflow.dto.response.NoteResponse;
import com.ngo.finance.outflow.entity.CreditNote;
import com.ngo.finance.outflow.entity.DebitNote;
import com.ngo.finance.outflow.service.OutflowScheduleService;
import org.springframework.stereotype.Component;

/**
 * Debit / credit note entity → {@link NoteResponse}. The id + name snapshot
 * columns are folded back into {@link RefDto} objects.
 */
@Component
public class NoteMapper {

    public NoteResponse toResponse(DebitNote n) {
        return rowFields(NoteResponse.builder(), n.getBudgetLine(), n.getQuarter())
                .id(n.getNoteCode())
                .recordId(n.getId())
                .date(n.getNoteDate())
                .amount(n.getAmount())
                .reason(n.getReason())
                .book(n.getBook().name())
                .payeeCategory(n.getPayeeCategory())
                .payee(RefDto.of(n.getPayeeRef(), n.getPayeeName()))
                .paymentMode(RefDto.of(n.getPaymentModeRef(), n.getPaymentModeName()))
                .bankAccount(RefDto.of(n.getBankAccountRef(), n.getBankAccountName()))
                .group(RefDto.of(n.getGroupRef(), n.getGroupName()))
                .ledger(RefDto.of(n.getLedgerRef(), n.getLedgerName()))
                .donor(RefDto.of(n.getDonorRef(), n.getDonorName()))
                .fundProfile(RefDto.of(n.getFundProfileRef(), n.getFundProfileName()))
                .grant(RefDto.of(n.getGrantRef(), n.getGrantName()))
                .reference(n.getReference())
                .remarks(n.getRemarks())
                .attachmentName(n.getAttachmentName())
                .createdBy(n.getCreatedBy())
                .createdAt(n.getCreatedAt())
                .build();
    }

    public NoteResponse toResponse(CreditNote n) {
        return NoteResponse.builder()
                .id(n.getNoteCode())
                .recordId(n.getId())
                .date(n.getNoteDate())
                .amount(n.getAmount())
                .book(n.getBook().name())
                .paymentMode(RefDto.of(n.getPaymentModeRef(), n.getPaymentModeName()))
                .bankAccount(RefDto.of(n.getBankAccountRef(), n.getBankAccountName()))
                .group(RefDto.of(n.getGroupRef(), n.getGroupName()))
                .ledger(RefDto.of(n.getLedgerRef(), n.getLedgerName()))
                .donor(RefDto.of(n.getDonorRef(), n.getDonorName()))
                .fundProfile(RefDto.of(n.getFundProfileRef(), n.getFundProfileName()))
                .grant(RefDto.of(n.getGrantRef(), n.getGrantName()))
                .disbursementType(n.getDisbursementType())
                .tranche(RefDto.of(n.getTrancheRef(), n.getTrancheName()))
                .reference(n.getReference())
                .remarks(n.getRemarks())
                .attachmentName(n.getAttachmentName())
                .createdBy(n.getCreatedBy())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private static NoteResponse.NoteResponseBuilder rowFields(NoteResponse.NoteResponseBuilder b, BudgetLine line, Short quarter) {
        if (line == null || quarter == null) {
            return b;
        }
        return b.outflowLineId(OutflowScheduleService.rowId(line.getBudget(), line, quarter))
                .budgetCode(line.getBudget().getBudgetCode())
                .lineCode(String.format("BL-%02d", line.getLineNo()))
                .quarter((int) quarter)
                .line(line.getDescription());
    }
}
