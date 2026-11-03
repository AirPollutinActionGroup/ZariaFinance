package com.ngo.finance.fundsuggestion.api;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.fundsuggestion.dto.request.UpdateFundSuggestionWeightsRequest;
import com.ngo.finance.fundsuggestion.dto.response.FundSuggestionResponse;
import com.ngo.finance.fundsuggestion.dto.response.FundSuggestionWeightsResponse;
import com.ngo.finance.fundsuggestion.service.FundSuggestionService;
import com.ngo.finance.fundsuggestion.service.FundSuggestionWeightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Ranked donor → fund profile → grant suggestions for a debit note being drafted. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/debit-notes/fund-suggestions")
@Tag(name = "Fund Suggestion", description = "Suggests funds a debit note can be charged to")
public class FundSuggestionController {

    private final FundSuggestionService fundSuggestionService;

    private final FundSuggestionWeightsService weightsService;

    @GetMapping
    @Operation(summary = "Top funds (default 10) a debit note on this outflow row can be charged to, best first")
    public ResponseEntity<List<FundSuggestionResponse>> suggestForDebitNote(
            @RequestParam String outflowLineId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ContributionType book,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(fundSuggestionService.suggestForDebitNote(outflowLineId, amount, date, book, limit));
    }

    @GetMapping("/weights")
    @Operation(summary = "The weights suggestions are scored with, and the shipped defaults")
    public ResponseEntity<FundSuggestionWeightsResponse> getWeights() {
        return ResponseEntity.ok(weightsService.get());
    }

    @PutMapping("/weights")
    @Operation(summary = "Change the suggestion weights (a reason is required)")
    public ResponseEntity<FundSuggestionWeightsResponse> updateWeights(@Valid @RequestBody UpdateFundSuggestionWeightsRequest request) {
        return ResponseEntity.ok(weightsService.update(request));
    }

    @PostMapping("/weights/reset")
    @Operation(summary = "Put the suggestion weights back to the shipped defaults")
    public ResponseEntity<FundSuggestionWeightsResponse> resetWeights(@RequestParam(required = false) String actor) {
        return ResponseEntity.ok(weightsService.resetToDefaults(actor));
    }
}
