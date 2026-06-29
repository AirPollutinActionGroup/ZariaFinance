-- V7: Additional Indexes and Constraints
-- Add unique constraints
ALTER TABLE grant_rule ADD CONSTRAINT uk_grant_rule_code UNIQUE (grant_id, rule_code);
ALTER TABLE grant_tranche ADD CONSTRAINT uk_grant_tranche_number UNIQUE (grant_id, tranche_number);

-- Add check constraints
ALTER TABLE grant_tranche ADD CONSTRAINT chk_tranche_amount CHECK (tranche_amount > 0);
ALTER TABLE grant_agreement ADD CONSTRAINT chk_grant_amount CHECK (total_grant_amount > 0);
ALTER TABLE grant_budget_head ADD CONSTRAINT chk_budget_amount CHECK (budgeted_amount > 0);

-- Add performance indexes
CREATE INDEX idx_grant_agreement_search ON grant_agreement(donor_id, programme_id, grant_status);
CREATE INDEX idx_grant_dates_range ON grant_agreement(start_date, end_date);
CREATE INDEX idx_donor_search ON donor_master(donor_type, fund_class, is_active);

-- Add indexes for common filtering
CREATE INDEX idx_grant_rule_status ON grant_rule(rule_status);
CREATE INDEX idx_reporting_status ON grant_reporting(reporting_status);
CREATE INDEX idx_document_current ON grant_document(is_current);
