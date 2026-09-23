-- V94: A Lump Sum donor disbursement rule now carries its own receiving_date,
--      matching the grant-side GrantDisbursementSchedule.receiving_date,
--      instead of only being reachable indirectly via its single
--      tranche-criterion row's expected_release_date.
ALTER TABLE donor_disbursement_rule ADD COLUMN receiving_date DATE;

UPDATE donor_disbursement_rule dr
SET receiving_date = tc.expected_release_date
FROM donor_tranche_criterion tc
WHERE tc.disbursement_rule_id = dr.id
  AND dr.disbursement_type = 'LUMP_SUM'
  AND dr.receiving_date IS NULL;
