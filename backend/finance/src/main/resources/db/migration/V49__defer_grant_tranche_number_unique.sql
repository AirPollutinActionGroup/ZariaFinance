-- V49: Make (grant_id, tranche_number) deferrable.
--
-- Saving a disbursement plan rewrites a grant's whole tranche list in one
-- transaction: rows are renumbered 1..n, new ones inserted and removed ones
-- deleted. Hibernate issues the inserts and updates before the deletes, so an
-- immediate unique check fires on a number that is about to be freed — even
-- though the committed state is perfectly valid.
--
-- Deferring moves the check to commit time. The constraint still holds; it is
-- simply not evaluated mid-statement. Same reasoning as
-- uq_profile_tranche_number (V41) and uq_criteria_tranche_sequence (V45).

ALTER TABLE grant_tranche DROP CONSTRAINT IF EXISTS uk_grant_tranche_number;

ALTER TABLE grant_tranche
    ADD CONSTRAINT uk_grant_tranche_number UNIQUE (grant_id, tranche_number)
        DEFERRABLE INITIALLY DEFERRED;
