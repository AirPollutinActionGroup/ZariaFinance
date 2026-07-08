/**
 * Zariya Donor Module — sample data transcribed from the Donor Module
 * Master Data Workbook (illustrative). See README for provenance notes.
 * These arrays are the INITIAL state; the app clones them into React state.
 */
export const L=1e5, CR=1e7;
export const PROGRAMMES=[
  {id:'PP1', code:'PRG-CLEANAIR', name:'Clean Air Action Programme', desc:'Air-quality monitoring, policy advocacy and community action across priority airsheds.', active:true, kind:'delivery'},
  {id:'PP2', code:'PRG-ISF', name:'India Science Festival', desc:'Annual flagship festival promoting public engagement with science.', active:true, kind:'delivery'},
  {id:'PP3', code:'PRG-ISBF', name:'India Science Book Fellowship', desc:'Fellowship funding authorship and publication of popular-science books.', active:true, kind:'delivery'},
  {id:'PP4', code:'PRG-WATER', name:'Urban Water & Sanitation', desc:'WASH infrastructure and behaviour-change programming in urban wards.', active:true, kind:'delivery'},
  {id:'PP5', code:'PRG-EDU', name:'Education & Livelihoods', desc:'School-readiness and youth livelihood interventions.', active:true, kind:'delivery'},
  {id:'PP6', code:'PRG-CORE', name:'Organisational Core / Unrestricted Pool', desc:'Holding programme for untied funds available for any organisational need.', active:true, kind:'pool'},
  {id:'PP7', code:'PRG-HOLD', name:'Suspense / Unconfirmed Rules', desc:'Suspense label for donors whose fund-use rules are unconfirmed; excluded from operating reports until reclassified.', active:true, kind:'pool'},
];
export const P=id=>PROGRAMMES.find(p=>p.id===id);

export const DONORS=[
  {id:'DNR-01', code:'DNR-CD-001', name:'Greenline Power CSR Trust', source:'CSR', type:'Corporate CSR', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 1', email:'greenline.contact@example.org', phone:'90000 10001', address:'1 Sample Street, City, India', pan:'AAECG1001K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Greenline.pdf'},
  {id:'DNR-02', code:'DNR-CD-002', name:'Mehta Cement CSR Foundation', source:'CSR', type:'Corporate CSR', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 2', email:'mehta.contact@example.org', phone:'90000 10002', address:'2 Sample Street, City, India', pan:'AAECG1002K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Mehta.pdf'},
  {id:'DNR-03', code:'DNR-CD-003', name:'Rohan Kapadia', source:'Individual', type:'Individual', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 3', email:'rohan.contact@example.org', phone:'90000 10003', address:'3 Sample Street, City, India', pan:'AAECG1003K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:null},
  {id:'DNR-04', code:'DNR-CD-004', name:'Anjali Verma', source:'Individual', type:'Individual', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 4', email:'anjali.contact@example.org', phone:'90000 10004', address:'4 Sample Street, City, India', pan:'AAECG1004K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:null},
  {id:'DNR-05', code:'DNR-CD-005', name:'Horizon Global Fund', source:'Untied · UC-based', type:'Foundation', domicile:'Foreign', fcra:true, foreignType:'Foreign — Government', country:'USA', contact:'Manager 5', email:'horizon.contact@example.org', phone:'90000 10005', address:'5 Sample Street, City, India', pan:'AAECG1005K', bankRef:'FCRA-DESIG-SBI-NDMB-0001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Horizon.pdf'},
  {id:'DNR-06', code:'DNR-CD-006', name:'Vikram Nair', source:'Individual', type:'Individual', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 6', email:'vikram.contact@example.org', phone:'90000 10006', address:'6 Sample Street, City, India', pan:'AAECG1006K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:null},
  {id:'DNR-07', code:'DNR-CD-007', name:'Suraksha Finserv CSR', source:'Pre-defined · UC-based', type:'Corporate CSR', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 7', email:'suraksha.contact@example.org', phone:'90000 10007', address:'7 Sample Street, City, India', pan:'AAECG1007K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Suraksha.pdf'},
  {id:'DNR-08', code:'DNR-CD-008', name:'Bluewave Sponsors Ltd', source:'Sponsorship', type:'Corporate Sponsor', domicile:'Foreign', fcra:true, foreignType:'Foreign — Private', country:'France', contact:'Manager 8', email:'bluewave.contact@example.org', phone:'90000 10008', address:'8 Sample Street, City, India', pan:'AAECG1008K', bankRef:'FCRA-DESIG-SBI-NDMB-0001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Bluewave.pdf'},
  {id:'DNR-09', code:'DNR-CD-009', name:'Priya Sundaram', source:'Individual', type:'Individual', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 9', email:'priya.contact@example.org', phone:'90000 10009', address:'9 Sample Street, City, India', pan:'AAECG1009K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:null},
  {id:'DNR-10', code:'DNR-CD-010', name:'Tarang Energy CSR Foundation', source:'CSR', type:'Corporate CSR', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 10', email:'tarang.contact@example.org', phone:'90000 10010', address:'10 Sample Street, City, India', pan:'AAECG1010K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Tarang.pdf'},
  {id:'DNR-11', code:'DNR-CD-011', name:'Aarohan CSR Foundation', source:'CSR', type:'Corporate CSR', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 12', email:'aarohan.contact@example.org', phone:'90000 10012', address:'12 Sample Street, City, India', pan:'AAECG1011K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Aarohan.pdf'},
  {id:'DNR-12', code:'DNR-CD-012', name:'Dr. Sunil Kulkarni', source:'Individual · ISBF', type:'Individual', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'Manager 13', email:'sunil.contact@example.org', phone:'90000 10013', address:'13 Sample Street, City, India', pan:'AAECG1012K', bankRef:'DOM-CA-1001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:null},
  {id:'DNR-13', code:'DNR-CD-013', name:'Vidya Global Trust', source:'Sponsorship · ISBF', type:'Foundation', domicile:'Foreign', fcra:true, foreignType:'Foreign — Private', country:'Germany', contact:'Manager 14', email:'vidya.contact@example.org', phone:'90000 10014', address:'14 Sample Street, City, India', pan:'AAECG1013K', bankRef:'FCRA-DESIG-SBI-NDMB-0001', active:true, status:'Active', createdAt:'2026-01-15', updatedAt:'2026-02-01', mou:'MoU_Vidya.pdf'},
  /* README + Fund-Class-Reference “pending” donor — the Draft edge case */
  {id:'DNR-14', code:'DNR-CD-014', name:'Nimbus Ventures CSR', source:'CSR', type:'Corporate CSR', domicile:'Domestic', fcra:false, foreignType:'Domestic / NA', country:null, contact:'—', email:'nimbus.contact@example.org', phone:'90000 10015', address:'15 Sample Street, City, India', pan:null, bankRef:null, active:false, status:'Draft', createdAt:'2026-06-20', updatedAt:'2026-06-20', mou:null,
   onboarding:{fundMode:false, fundClass:false, pan:false, bankRef:false, financeApproved:false}},
];
export const D=id=>DONORS.find(d=>d.id===id);

export const PROFILES=[
  {id:'FP-1', donorId:'DNR-01', mode:'Restricted', cls:'A', purpose:'Clean Air Action (defined project only)', tied:false, prog:'PP1', freq:'Quarterly', adminAllowed:true, overhead:5, movement:false, explain:false, onboarded:true},
  {id:'FP-2', donorId:'DNR-02', mode:'Restricted', cls:'A', purpose:'Urban Water & Sanitation (defined project)', tied:false, prog:'PP4', freq:'Quarterly', adminAllowed:true, overhead:5, movement:false, explain:false, onboarded:true},
  {id:'FP-3', donorId:'DNR-03', mode:'Unrestricted', cls:'C', purpose:'Untied general donation', tied:false, prog:'PP6', freq:'Annual', adminAllowed:true, overhead:null, movement:true, explain:false, onboarded:true},
  {id:'FP-4', donorId:'DNR-04', mode:'Unrestricted', cls:'C', purpose:'Untied general donation', tied:false, prog:null, freq:'Annual', adminAllowed:true, overhead:null, movement:true, explain:false, onboarded:true},
  {id:'FP-5', donorId:'DNR-05', mode:'Unrestricted', cls:'B', purpose:'Untied but utilisation-context governed', tied:false, prog:'PP6', freq:'Half-yearly', adminAllowed:true, overhead:10, movement:true, explain:true, onboarded:true},
  {id:'FP-6', donorId:'DNR-06', mode:'Unrestricted', cls:'C', purpose:'Untied general donation', tied:false, prog:null, freq:'Annual', adminAllowed:true, overhead:null, movement:true, explain:false, onboarded:true},
  {id:'FP-7', donorId:'DNR-07', mode:'Restricted', cls:'A', purpose:'Clean Air — pre-defined, UC-based', tied:false, prog:'PP1', freq:'Quarterly', adminAllowed:true, overhead:5, movement:false, explain:false, onboarded:true},
  {id:'FP-8', donorId:'DNR-08', mode:'Unrestricted', cls:'C·tied', purpose:'Sponsorship purpose-tied to India Science Festival only', tied:true, prog:'PP2', freq:'Annual', adminAllowed:true, overhead:null, movement:false, explain:false, onboarded:true},
  {id:'FP-9', donorId:'DNR-09', mode:'Unrestricted', cls:'C', purpose:'Untied general donation', tied:false, prog:'PP6', freq:'Annual', adminAllowed:true, overhead:null, movement:true, explain:false, onboarded:true},
  {id:'FP-10', donorId:'DNR-10', mode:'Restricted', cls:'A', purpose:'Education & Livelihoods — defined project', tied:false, prog:'PP5', freq:'Quarterly', adminAllowed:true, overhead:5, movement:false, explain:false, onboarded:true},
  {id:'FP-11', donorId:'DNR-11', mode:'Restricted', cls:'A·tied', purpose:'CSR purpose-tied to India Science Festival', tied:true, prog:'PP2', freq:'Quarterly', adminAllowed:true, overhead:5, movement:false, explain:false, onboarded:true},
  {id:'FP-12', donorId:'DNR-12', mode:'Restricted', cls:'A·tied', purpose:'Restricted to one specific ISBF book', tied:true, prog:'PP3', freq:'Quarterly', adminAllowed:false, overhead:null, movement:false, explain:false, onboarded:true},
  {id:'FP-13', donorId:'DNR-13', mode:'Restricted', cls:'A·tied', purpose:'Sponsorship restricted to one ISBF book', tied:true, prog:'PP3', freq:'Quarterly', adminAllowed:true, overhead:10, movement:false, explain:false, onboarded:true},
  {id:'FP-14', donorId:'DNR-14', mode:null, cls:'pending', purpose:'Fund-use rule unconfirmed — held in suspense', tied:false, prog:'PP7', freq:null, adminAllowed:null, overhead:null, movement:false, explain:false, onboarded:false},
];
export const FP=id=>PROFILES.find(p=>p.id===id);

export const GEO=[
  ['DGID-1','FP-1','Delhi NCR'],['DGID-1.1','FP-1','Uttar Pradesh'],
  ['DGID-2','FP-2','Maharashtra'],
  ['DGID-3','FP-3','Pan-India (untied)'],['DGID-4','FP-4','Pan-India (untied)'],
  ['DGID-5','FP-5','Pan-India (untied)'],['DGID-6','FP-6','Pan-India (untied)'],
  ['DGID-7','FP-7','Delhi NCR'],['DGID-7.1','FP-7','Punjab'],['DGID-7.2','FP-7','Haryana'],
  ['DGID-8','FP-8','Pan-India (festival venues)'],
  ['DGID-9','FP-9','Pan-India (untied)'],
  ['DGID-10','FP-10','Bihar'],['DGID-10.1','FP-10','Jharkhand'],
  ['DGID-11','FP-11','Pan-India (festival venues)'],
  ['DGID-12','FP-12','Pan-India (publication)'],['DGID-13','FP-13','Pan-India (publication)'],
].map(([id,fp,g])=>({id,fp,geo:g}));

export const URULES=[
  ['RID-01','FP-1','Admin / Overhead cap',5,'Admin overhead recovery capped at 5% of grant value (per agreement).'],
  ['RID-02','FP-1','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
  ['RID-03','FP-2','Admin / Overhead cap',5,'Admin overhead recovery capped at 5% of grant value (per agreement).'],
  ['RID-04','FP-2','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
  ['RID-05','FP-5','Admin / Overhead cap',10,'Admin overhead recovery capped at 10% of grant value (per agreement).'],
  ['RID-06','FP-7','Admin / Overhead cap',5,'Admin overhead recovery capped at 5% of grant value (per agreement).'],
  ['RID-07','FP-7','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
  ['RID-08','FP-10','Admin / Overhead cap',5,'Admin overhead recovery capped at 5% of grant value (per agreement).'],
  ['RID-09','FP-10','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
  ['RID-10','FP-11','Admin / Overhead cap',5,'Admin overhead recovery capped at 5% of grant value (per agreement).'],
  ['RID-11','FP-11','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
  ['RID-12','FP-12','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
  ['RID-13','FP-13','Admin / Overhead cap',10,'Admin overhead recovery capped at 10% of grant value (per agreement).'],
  ['RID-14','FP-13','Fundraising cost exclusion',0,'Grant may not be applied to fundraising / resource-mobilisation cost lines.'],
].map(([id,fp,type,pct,desc])=>({id,fp,type,pct,desc}));

export const DRULES=[
  ['DRID-01','FP-1','Tranche-on-UC','Milestone + utilisation gate',75,true,'Management UC','Next tranche only after ≥75% of the prior tranche is utilised AND the milestone / UC is accepted by the donor.'],
  ['DRID-02','FP-2','Tranche-on-UC','Milestone + utilisation gate',75,true,'Management UC','Next tranche only after ≥75% of the prior tranche is utilised AND the milestone / UC is accepted by the donor.'],
  ['DRID-03','FP-3','Lump-sum / on-receipt','Unconditional',null,false,null,'Untied receipt; recognised on receipt, no conditional release schedule.'],
  ['DRID-04','FP-4','Lump-sum / on-receipt','Unconditional',null,false,null,'Untied receipt; recognised on receipt, no conditional release schedule.'],
  ['DRID-05','FP-5','Tranche-on-report','Utilisation threshold',60,false,null,'Next tranche after ≥60% of the prior tranche is utilised and a utilisation-context report is submitted; movement permitted with explanation.'],
  ['DRID-06','FP-6','Lump-sum / on-receipt','Unconditional',null,false,null,'Untied receipt; recognised on receipt, no conditional release schedule.'],
  ['DRID-07','FP-7','Tranche-on-UC','Milestone + utilisation gate',75,true,'Management UC','Subsequent tranche released only after the UC for the prior tranche is accepted.'],
  ['DRID-08','FP-8','Lump-sum / on-receipt','Unconditional',null,false,null,'Untied receipt; recognised on receipt, no conditional release schedule.'],
  ['DRID-09','FP-9','Lump-sum / on-receipt','Unconditional',null,false,null,'Untied receipt; recognised on receipt, no conditional release schedule.'],
  ['DRID-10','FP-10','Tranche-on-UC','Milestone + utilisation gate',75,true,'Management UC','Next tranche only after ≥75% utilised AND milestone / UC accepted.'],
  ['DRID-11','FP-11','Tranche-on-UC','Milestone + utilisation gate',75,true,'Management UC','Next tranche only after ≥75% utilised AND milestone / UC accepted.'],
  ['DRID-12','FP-12','Tranche-on-UC','Milestone + utilisation gate',75,true,'Audit UC','Next tranche only after ≥75% utilised AND milestone / UC accepted.'],
  ['DRID-13','FP-13','Tranche-on-UC','Milestone + utilisation gate',75,true,'Audit UC','Next tranche only after ≥75% utilised AND milestone / UC accepted.'],
  ['DRID-14','FP-14','Hold','Blocked until onboarding completes',null,false,null,'Disbursement held: fund-use rule unconfirmed (PRG-HOLD). No receipt may be recognised.'],
].map(([id,fp,type,trigger,minUtil,milestone,ucType,desc])=>({id,fp,type,trigger,minUtil,milestone,ucType,desc}));

/* Grants — sheet 07. amounts in grant currency; INR = amount × fxRate (locked at signing). */
export const GRANTS=[
  {id:'GID-01', donorId:'DNR-01', fp:'FP-1',  name:'Greenline Power CSR Trust : PRG-CLEANAIR FY26', ref:'ZRY/GA/2026/001', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:5000000, fx:1,     status:'Active', approved:'CFO · 20 Mar', utilisedInr:2500000},
  {id:'GID-02', donorId:'DNR-02', fp:'FP-2',  name:'Mehta Cement CSR Foundation : PRG-WATER FY26', ref:'ZRY/GA/2026/002', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:3000000, fx:1,     status:'Active', approved:'CFO · 20 Mar', utilisedInr:1550000},
  {id:'GID-03', donorId:'DNR-03', fp:'FP-3',  name:'Rohan Kapadia — Untied support FY26', ref:'ZRY/GA/2026/003', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:150000, fx:1,      status:'Active', approved:'CFO · 20 Mar', utilisedInr:120000},
  {id:'GID-04', donorId:'DNR-04', fp:'FP-4',  name:'Anjali Verma — Untied support FY26', ref:'ZRY/GA/2026/004', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:100000, fx:1,      status:'Active', approved:'CFO · 20 Mar', utilisedInr:80000},
  {id:'GID-05', donorId:'DNR-05', fp:'FP-5',  name:'Horizon Global Fund — Untied support FY26', ref:'ZRY/GA/2026/005', start:'2026-04-01', end:'2027-03-31', ccy:'USD', amount:200000, fx:83.5,   status:'Active', approved:'CEO+Board · 18 Mar', utilisedInr:11000000},
  {id:'GID-06', donorId:'DNR-06', fp:'FP-6',  name:'Vikram Nair — Untied support FY26', ref:'ZRY/GA/2026/006', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:120000, fx:1,      status:'Closed', approved:'CFO · 20 Mar', utilisedInr:120000},
  {id:'GID-07', donorId:'DNR-07', fp:'FP-7',  name:'Suraksha Finserv CSR : PRG-CLEANAIR FY26', ref:'ZRY/GA/2026/007', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:4000000, fx:1,     status:'Active', approved:'CFO · 20 Mar', utilisedInr:2050000},
  {id:'GID-08', donorId:'DNR-08', fp:'FP-8',  name:'Bluewave Sponsors Ltd : PRG-ISF FY26', ref:'ZRY/GA/2026/008', start:'2026-04-01', end:'2027-03-31', ccy:'GBP', amount:300000, fx:105.2,  status:'Active', approved:'CEO+Board · 18 Mar', utilisedInr:18000000},
  {id:'GID-09', donorId:'DNR-09', fp:'FP-9',  name:'Priya Sundaram — Untied support FY26', ref:'ZRY/GA/2026/009', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:90000, fx:1,       status:'Active', approved:'CFO · 20 Mar', utilisedInr:50000},
  {id:'GID-10', donorId:'DNR-10', fp:'FP-10', name:'Tarang Energy CSR Foundation : PRG-EDU FY26', ref:'ZRY/GA/2026/010', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:6000000, fx:1,     status:'Active', approved:'CFO · 20 Mar', utilisedInr:3100000},
  {id:'GID-11', donorId:'DNR-11', fp:'FP-11', name:'Aarohan CSR Foundation : PRG-ISF FY26', ref:'ZRY/GA/2026/011', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:3500000, fx:1,     status:'Active', approved:'CFO · 20 Mar', utilisedInr:1800000},
  {id:'GID-12', donorId:'DNR-12', fp:'FP-12', name:'Dr. Sunil Kulkarni : PRG-ISBF FY26', ref:'ZRY/GA/2026/012', start:'2026-04-01', end:'2027-03-31', ccy:'INR', amount:500000, fx:1,      status:'Active', approved:'CFO · 20 Mar', utilisedInr:260000},
  {id:'GID-13', donorId:'DNR-13', fp:'FP-13', name:'Vidya Global Trust : PRG-ISBF FY26', ref:'ZRY/GA/2026/013', start:'2026-04-01', end:'2027-03-31', ccy:'EUR', amount:400000, fx:90.1,   status:'Active', approved:'CEO+Board · 18 Mar', utilisedInr:8500000},
  /* Feedback issue #1 scenario: grant against a Draft donor → Blocked, commitment excluded */
  {id:'GID-14', donorId:'DNR-14', fp:'FP-14', name:'Nimbus Ventures CSR : programme TBC FY26', ref:'ZRY/GA/2026/014', start:'2026-07-01', end:'2027-06-30', ccy:'INR', amount:10000000, fx:1, status:'Blocked', approved:'—', utilisedInr:0},
];
export const G_=id=>GRANTS.find(g=>g.id===id);

/* Tranches — sheet 08 (amounts in grant currency; GID re-keyed by donor name). */
export const TRANCHES=[
  {id:'TID-01', gid:'GID-01', no:1, exp:1666666.67, expDate:'2026-04-15', act:1666666.67, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-02', gid:'GID-01', no:2, exp:1666666.67, expDate:'2026-07-15', act:1666666.67, actDate:'2026-07-20', status:'Received', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-03', gid:'GID-01', no:3, exp:1666666.66, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
  {id:'TID-04', gid:'GID-02', no:1, exp:1000000, expDate:'2026-04-15', act:1000000, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-05', gid:'GID-02', no:2, exp:1000000, expDate:'2026-07-15', act:1000000, actDate:'2026-07-20', status:'Received', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-06', gid:'GID-02', no:3, exp:1000000, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
  {id:'TID-07', gid:'GID-03', no:1, exp:150000, expDate:'2026-04-15', act:150000, actDate:'2026-04-18', status:'Received', cond:'Lump-sum on receipt (no gate)', gate:null},
  {id:'TID-08', gid:'GID-04', no:1, exp:100000, expDate:'2026-04-15', act:100000, actDate:'2026-04-18', status:'Received', cond:'Lump-sum on receipt (no gate)', gate:null},
  {id:'TID-09', gid:'GID-05', no:1, exp:100000, expDate:'2026-04-15', act:100000, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-10', gid:'GID-05', no:2, exp:100000, expDate:'2026-07-15', act:100000, actDate:'2026-07-20', status:'Received', cond:'≥60% of Tranche 1 utilised + utilisation report accepted', gate:60},
  {id:'TID-11', gid:'GID-06', no:1, exp:120000, expDate:'2026-04-15', act:120000, actDate:'2026-04-18', status:'Received', cond:'Lump-sum on receipt (no gate)', gate:null},
  {id:'TID-12', gid:'GID-07', no:1, exp:1333333.33, expDate:'2026-04-15', act:1333333.33, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-13', gid:'GID-07', no:2, exp:1333333.33, expDate:'2026-07-15', act:1333333.33, actDate:'2026-07-20', status:'Received', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-14', gid:'GID-07', no:3, exp:1333333.34, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
  {id:'TID-15', gid:'GID-08', no:1, exp:300000, expDate:'2026-04-15', act:300000, actDate:'2026-04-18', status:'Received', cond:'Lump-sum on receipt (no gate)', gate:null},
  {id:'TID-16', gid:'GID-09', no:1, exp:90000, expDate:'2026-04-15', act:90000, actDate:'2026-04-18', status:'Received', cond:'Lump-sum on receipt (no gate)', gate:null},
  {id:'TID-17', gid:'GID-10', no:1, exp:2000000, expDate:'2026-04-15', act:2000000, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-18', gid:'GID-10', no:2, exp:2000000, expDate:'2026-07-15', act:2000000, actDate:'2026-07-20', status:'Received', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-19', gid:'GID-10', no:3, exp:2000000, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
  {id:'TID-20', gid:'GID-11', no:1, exp:1166666.67, expDate:'2026-04-15', act:1166666.67, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-21', gid:'GID-11', no:2, exp:1166666.67, expDate:'2026-07-15', act:1166666.67, actDate:'2026-07-20', status:'Received', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-22', gid:'GID-11', no:3, exp:1166666.66, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
  {id:'TID-23', gid:'GID-12', no:1, exp:166666.67, expDate:'2026-04-15', act:166666.67, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-24', gid:'GID-12', no:2, exp:166666.67, expDate:'2026-07-15', act:166666.67, actDate:'2026-07-20', status:'Received', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-25', gid:'GID-12', no:3, exp:166666.66, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
  {id:'TID-26', gid:'GID-13', no:1, exp:133333.33, expDate:'2026-04-15', act:133333.33, actDate:'2026-04-18', status:'Received', cond:'Advance on signed agreement', gate:null},
  {id:'TID-27', gid:'GID-13', no:2, exp:133333.33, expDate:'2026-07-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 1 utilised + milestone / UC accepted', gate:75},
  {id:'TID-28', gid:'GID-13', no:3, exp:133333.34, expDate:'2026-10-15', act:null, actDate:null, status:'Expected', cond:'≥75% of Tranche 2 utilised + milestone / UC accepted', gate:75},
];

export const FUNDCLASS=[
  {cls:'Class A', label:'Fully restricted', move:'No', explain:'N/A (movement blocked)', report:'Project-level utilisation certificate required', donors:'Greenline · Mehta · Suraksha · Tarang · Aarohan · Kulkarni · Vidya'},
  {cls:'Class B', label:'Unrestricted with explanation', move:'Yes', explain:'Yes (audit entry per move)', report:'Movement audit trail in utilisation context', donors:'Horizon'},
  {cls:'Class C', label:'Fully unrestricted', move:'Yes', explain:'No', report:'Aggregate reporting only', donors:'Rohan · Anjali · Vikram · Priya'},
  {cls:'(edge)', label:'Programme-tied', move:'Constrained to programme', explain:'No', report:'Programme-level utilisation certificate', donors:'Bluewave (ISF) · Aarohan (ISF) · Kulkarni, Vidya (ISBF)'},
  {cls:'(pending)', label:'Unconfirmed at onboarding', move:'Blocked', explain:'N/A', report:'Cannot reach Active status', donors:'Nimbus'},
];

/* Feedback V0.0 — review & issue-tracking register (Tech Team) */
export const FEEDBACK=[
  {no:1, area:'Grants + Dashboard', cat:'Data integrity', pri:'Critical',
   issue:'An Active grant of ₹1.00 Cr is linked to a donor whose record is still Draft. The dashboard shows “0 active donors” yet “₹1.00 Cr committed / Active”.',
   risk:'A live commitment held against an unverified donor corrupts every downstream figure — committed, available, donor & FCRA reports — a real audit finding.',
   process:'A grant may be Active / hold commitment only if its donor is fully onboarded and Active. Donor and grant status must always be consistent.',
   build:'Block a grant from becoming Active (and holding committed amount) while donor.status ≠ Active. Surface the clash as a dashboard exception.',
   validation:'grant.status="Active" requires donor.status="Active"; committed = 0 while donor is Draft', approval:'System rule (no manual override)'},
  {no:2, area:'Donor Register', cat:'Validation / workflow', pri:'Critical',
   issue:'No onboarding-completeness gate — a donor can exist and advance without the fields that define it.',
   risk:'Donors reach Active without Fund Class / Fund Mode / FCRA details, so compliance rules cannot run and grants attach to empty records.',
   process:'A donor cannot become Active until all mandatory attributes are captured and Finance approves.',
   build:'“Activate” stays disabled until mandatory fields are complete; completion routes to Finance approval; only then Active; only then grants are allowed.',
   validation:'Block Activate if any mandatory field (type, domicile, fund mode, fund class, FCRA-if-foreign, PAN, bank ref) is blank', approval:'Finance / CFO approves activation'},
];

