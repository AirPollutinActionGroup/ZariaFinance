-- V31: Re-hash the V12 demo user passwords with BCrypt.
--
-- LoginServiceImpl and UserRegisterServiceImpl now compare/store passwords via
-- PasswordEncoder (BCrypt) instead of plain text, so the plain-text values
-- seeded in V12 no longer authenticate. Hashes below correspond to the same
-- demo passwords documented in V12 (e.g. ceoadmin / Ceo@12345).

UPDATE users SET password = '$2a$10$76cneQY2pXMaA1tVk8t75exPzN/yI.bJd4PbVo01lLF.qBBUY7Wzu' WHERE username = 'ceoadmin';
UPDATE users SET password = '$2a$10$dYvbBYmiL7qXEDiUFba5m.Jg0Gz31ZPIyH3u98UxKj4Tfsvqvw.PS' WHERE username = 'financeofc';
UPDATE users SET password = '$2a$10$Xxcm/ZdpLBSuK2nH1iw.Fe5UfcT3afMHDX6g/FiBvnfBJJxOncJsK' WHERE username = 'fundlead';
UPDATE users SET password = '$2a$10$/P9TBQvbLkW8rFwct4ag3OAMbVUuBk3KTCPewAnYv8ZVuQXCPszC.' WHERE username = 'pendingfo';
UPDATE users SET password = '$2a$10$dOSxxLz6yp5zBzIyJ.picOHHF701YAWV9np7TFV30LWT5PwgruK3y' WHERE username = 'rejectedfl';
