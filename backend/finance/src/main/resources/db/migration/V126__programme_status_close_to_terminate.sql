-- V126: the Programme/Project lifecycle status "Close" is renamed "Terminate".
ALTER TABLE programme DROP CONSTRAINT chk_programme_status;
UPDATE programme SET status = 'Terminate' WHERE status = 'Close';
ALTER TABLE programme ADD CONSTRAINT chk_programme_status CHECK (
    status IN ('Planned', 'Active', 'On Hold', 'Complete', 'Terminate')
);
