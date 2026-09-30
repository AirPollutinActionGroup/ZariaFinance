package com.ngo.finance.outflow.api;

import com.ngo.finance.outflow.dto.request.CreateCreditNoteRequest;
import com.ngo.finance.outflow.dto.response.NoteResponse;
import com.ngo.finance.outflow.service.CreditNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Money that came back (refunds, rebates, reversals). Notes are addressed by code, e.g. CN-2026-001. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/credit-notes")
@Tag(name = "Credit Note", description = "Credit note APIs")
public class CreditNoteController {

    private final CreditNoteService creditNoteService;

    @GetMapping
    @Operation(summary = "List credit notes, newest first")
    public ResponseEntity<List<NoteResponse>> listCreditNotes() {
        return ResponseEntity.ok(creditNoteService.listCreditNotes());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get a credit note by code")
    public ResponseEntity<NoteResponse> getCreditNote(@PathVariable String code) {
        return ResponseEntity.ok(creditNoteService.getCreditNote(code));
    }

    @PostMapping
    @Operation(summary = "Issue a credit note (optionally against an outflow row / reversing a debit note)")
    public ResponseEntity<NoteResponse> createCreditNote(@Valid @RequestBody CreateCreditNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(creditNoteService.createCreditNote(request));
    }
}
