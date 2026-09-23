-- Removes the "Disbursement Rules" feature (tranche scheduling, structured
-- release criteria, reminders/escalation) and grant document storage in full,
-- along with the underlying grant_tranche table. Drop order follows FK
-- dependency: reminder -> criteria -> tranche, plus the standalone
-- disbursement-schedule header and grant_document.
DROP TABLE IF EXISTS grant_criteria_reminder;
DROP TABLE IF EXISTS grant_tranche_criteria;
DROP TABLE IF EXISTS grant_disbursement_schedule;
DROP TABLE IF EXISTS grant_tranche;
DROP TABLE IF EXISTS grant_document;
