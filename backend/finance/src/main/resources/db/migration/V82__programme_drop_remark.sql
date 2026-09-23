-- V82: Programme's Remark field is dropped — decided against keeping it on
--      the Programme record (unlike Employee's Remark, which stays).
ALTER TABLE programme DROP COLUMN remark;
