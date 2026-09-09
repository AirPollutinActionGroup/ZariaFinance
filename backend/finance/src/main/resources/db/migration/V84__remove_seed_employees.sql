-- V84: The 12 employees seeded by V74 (EMP-01..EMP-12) were placeholder demo
--      data. Real employees are now entered through the app, so remove the
--      seed rows — every dependent table (employee_state, employee_city,
--      employee_programme, employee_update_log, employee_allocation) has
--      ON DELETE CASCADE on employee_id and cleans up automatically.
DELETE FROM employee WHERE emp_id IN (
    'EMP-01', 'EMP-02', 'EMP-03', 'EMP-04', 'EMP-05', 'EMP-06',
    'EMP-07', 'EMP-08', 'EMP-09', 'EMP-10', 'EMP-11', 'EMP-12'
);
