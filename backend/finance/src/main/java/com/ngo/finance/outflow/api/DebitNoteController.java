package com.ngo.finance.outflow.api;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.outflow.dto.request.CreateDebitNoteRequest;
import com.ngo.finance.outflow.dto.response.FundSuggestionResponse;
import com.ngo.finance.outflow.dto.response.NoteResponse;
import com.ngo.finance.outflow.service.DebitNoteService;
import com.ngo.finance.outflow.service.FundSuggestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Debit (out) payments against outflow rows. Notes are addressed by code, e.g. DN-2026-001. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/debit-notes")
@Tag(name = "Debit Note", description = "Debit note APIs")
public class DebitNoteController {

    private final DebitNoteService debitNoteService;

    private final FundSuggestionService fundSuggestionService;

    @GetMapping
    @Operation(summary = "List debit notes, newest first")
    public ResponseEntity<List<NoteResponse>> listDebitNotes() {
        return ResponseEntity.ok(debitNoteService.listDebitNotes());
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Rank the donor funds a debit note on an outflow row could be charged to (top 10)")
    public ResponseEntity<FundSuggestionResponse> suggestFunds(
            @RequestParam String outflowLineId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ContributionType book) {
        return ResponseEntity.ok(fundSuggestionService.suggest(outflowLineId, amount, date, book));
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get a debit note by code")
    public ResponseEntity<NoteResponse> getDebitNote(@PathVariable String code) {
        return ResponseEntity.ok(debitNoteService.getDebitNote(code));
    }

    @PostMapping
    @Operation(summary = "Issue a debit note against an outflow row")
    public ResponseEntity<NoteResponse> createDebitNote(@Valid @RequestBody CreateDebitNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(debitNoteService.createDebitNote(request));
    }
}
