-- V22: Re-hash the plaintext sample-user passwords seeded by V12 now that
-- LoginServiceImpl verifies credentials with BCrypt instead of a raw string
-- comparison.
--
-- Guarded on username + the known plaintext value so this only touches rows
-- that still hold the original demo password (safe to re-run, and won't
-- clobber a password a user has since changed).

UPDATE users SET password = '$2a$10$ee8nm2iOddFvTVEP2kz5d.P.O4gQd9ivivKlMS.c3wp0Vd/voYGUy' WHERE username = 'ceoadmin'   AND password = 'Ceo@12345';
UPDATE users SET password = '$2a$10$XR54IM42QYPkA1vm9emJguLYGUKeSe7TnBVILjqzE5tawcaTRP46q' WHERE username = 'financeofc' AND password = 'Finance@123';
UPDATE users SET password = '$2a$10$X8m1lpeCb/V4xSuTMY/lMu.l5/QEjV.LRmOlHfVSHVMGqSakSQa7W' WHERE username = 'fundlead'   AND password = 'Fund@12345';
UPDATE users SET password = '$2a$10$gBsLIs.HEb.Mm.//gUpVLuyTW85phIZvN3x1l4I.n4N7FWJfpmAfK' WHERE username = 'pendingfo'  AND password = 'Pending@123';
UPDATE users SET password = '$2a$10$caW75gUg9sJ7RvMeNjwHJeUyYe1GzKus5sLRJyFUrz0vhmCNKCNIe' WHERE username = 'rejectedfl' AND password = 'Rejected@12';
