-- V19: Grant rework — a grant now inherits its donor, programme and fund class
--      from its fund profile (fund_profile_id, added in V16). Two existing
--      NOT NULL columns must relax:
--        * fund_class    — superseded by the profile's A/B/C class; kept nullable
--                          for now rather than dropped (avoids touching the enum).
--        * programme_id  — untied grants have no programme (profile.programme is
--                          nullable), so the grant's programme may be null too.

ALTER TABLE grant_agreement ALTER COLUMN fund_class DROP NOT NULL;
ALTER TABLE grant_agreement ALTER COLUMN programme_id DROP NOT NULL;
