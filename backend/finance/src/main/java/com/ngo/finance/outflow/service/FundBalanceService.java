package com.ngo.finance.outflow.service;

import com.ngo.finance.outflow.repository.CreditNoteRepository;
import com.ngo.finance.outflow.repository.DebitNoteRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Balance on a donor fund profile: received (its credit notes) − debited (the
 * debit notes charged to it). Notes refer to a fund by its id as a string.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FundBalanceService {

    private final CreditNoteRepository creditNoteRepository;

    private final DebitNoteRepository debitNoteRepository;

    /** Received and debited on one fund. */
    public record FundBalance(BigDecimal received, BigDecimal debited) {

        public static final FundBalance EMPTY = new FundBalance(BigDecimal.ZERO, BigDecimal.ZERO);

        public BigDecimal available() {
            return received.subtract(debited);
        }
    }

    public FundBalance balanceOf(String fundProfileRef) {
        return new FundBalance(creditNoteRepository.sumOnFundProfile(fundProfileRef),
                debitNoteRepository.sumOnFundProfile(fundProfileRef));
    }

    /** Every fund that has a note against it, by fund profile ref. Funds with none are absent. */
    public Map<String, FundBalance> balancesByFund() {
        Map<String, BigDecimal> received = sums(creditNoteRepository.sumByFundProfile());
        Map<String, BigDecimal> debited = sums(debitNoteRepository.sumByFundProfile());
        Map<String, FundBalance> balances = new HashMap<>();
        received.forEach((ref, sum) -> balances.put(ref, new FundBalance(sum, debited.getOrDefault(ref, BigDecimal.ZERO))));
        debited.forEach((ref, sum) -> balances.putIfAbsent(ref, new FundBalance(BigDecimal.ZERO, sum)));
        return balances;
    }

    private static Map<String, BigDecimal> sums(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] r : rows) {
            map.put(String.valueOf(r[0]).trim(), (BigDecimal) r[1]);
        }
        return map;
    }
}
