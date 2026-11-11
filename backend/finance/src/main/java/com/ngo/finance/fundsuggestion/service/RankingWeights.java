package com.ngo.finance.fundsuggestion.service;

/**
 * Points a fund earns towards its suggestion score (see FundSuggestionRanker).
 * {@link #DEFAULTS} is what ships; the saved copy is edited under Master
 * Configuration → Fund Suggestion.
 *
 * @param programmeMatch          same programme as the budget
 * @param coversAmount            available balance covers the whole note
 * @param restrictedForProgramme  a Class A fund given for this programme
 * @param expiryMax               most points for a grant ending soon
 * @param hasGrant                backed by a grant agreement
 * @param unrestricted            Class B / C money (zero or negative)
 * @param expiryWindowDays        a grant ending this many days or more out earns no expiry points
 */
public record RankingWeights(
        int programmeMatch,
        int coversAmount,
        int restrictedForProgramme,
        int expiryMax,
        int hasGrant,
        int unrestricted,
        int expiryWindowDays) {

    public static final RankingWeights DEFAULTS = new RankingWeights(40, 25, 15, 15, 5, -10, 90);
}
