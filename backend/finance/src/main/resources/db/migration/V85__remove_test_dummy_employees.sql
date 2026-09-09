-- V85: Remove the "Test Dummy" employees (EMP-D1..EMP-D5) created through the
--      app during earlier manual testing. Every dependent table
--      (employee_state, employee_city, employee_programme,
--      employee_update_log, employee_allocation) has ON DELETE CASCADE on
--      employee_id and cleans up automatically.
DELETE FROM employee WHERE emp_id LIKE 'EMP-D%';
