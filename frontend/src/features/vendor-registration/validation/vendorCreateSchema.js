import { z } from 'zod';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PINCODE_REGEX = /^\d{6}$/;
const PHONE_REGEX = /^\d{10}$/;

export const vendorCreateSchema = z
  .object({
    entityType: z.enum(
      ['Individual', 'Proprietorship', 'Partnership', 'Pvt Ltd', 'LLP', 'Trust', 'Section 8'],
      { errorMap: () => ({ message: 'Entity type is required' }) },
    ),

    // Identification
    legalName: z.string().min(2, 'Legal name is required'),
    hasIncorporationCertificate: z.enum(['Yes', 'No']).optional(),
    dateOfIncorporation: z.string().optional(),
    registrationNo: z.string().optional(),
    aadhaarNumber: z.string().optional(),

    // Tax & Statutory
    panNumber: z.string().regex(PAN_REGEX, 'Enter a valid PAN (e.g. ABCDE1234F)'),
    hasGstRegistration: z.enum(['Yes', 'No']).optional(),
    gstNumber: z
      .string()
      .optional()
      .refine((val) => !val || GST_REGEX.test(val), 'Enter a valid GSTIN'),
    gstRegistrationType: z
      .enum(['Regular', 'Composition', 'Unregistered', 'SEZ'])
      .optional(),
    tanNumber: z.string().optional(),
    hasMsmeRegistration: z.enum(['Yes', 'No']).optional(),
    udyamNumber: z.string().optional(),
    enterpriseClassification: z.enum(['Micro', 'Small', 'Medium']).optional(),
    tdsSection: z.enum(['194C', '194J'], {
      errorMap: () => ({ message: 'TDS applicable section is required' }),
    }),

    // Banking
    accountNumber: z.string().min(4, 'Account number is required'),
    ifscCode: z.string().regex(IFSC_REGEX, 'Enter a valid IFSC code'),
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    paymentMode: z.string().min(1, 'Payment mode preference is required'),

    // Contact & Address
    contactName: z.string().min(2, 'Contact name is required'),
    phoneNumber: z.string().regex(PHONE_REGEX, 'Enter a valid 10-digit phone number'),
    contactEmail: z.string().email('Enter a valid email address'),
    registeredAddress: z.string().min(5, 'Registered address is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().regex(PINCODE_REGEX, 'Enter a valid 6-digit pincode'),

    // Classification & workflow
    vendorCategory: z.enum(
      ['Goods', 'Services', 'Consulting', 'Logistics', 'IT', 'Grantee-linked'],
      { errorMap: () => ({ message: 'Vendor category is required' }) },
    ),
    relatedParty: z.enum(['Yes', 'No'], {
      errorMap: () => ({ message: 'Select whether the vendor is a related party' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.entityType === 'Individual') {
      if (!data.aadhaarNumber || !AADHAAR_REGEX.test(data.aadhaarNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['aadhaarNumber'],
          message: 'Enter a valid 12-digit Aadhaar number',
        });
      }
    } else {
      if (data.hasIncorporationCertificate !== 'Yes' && data.hasIncorporationCertificate !== 'No') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hasIncorporationCertificate'],
          message: 'Select whether an Incorporation Certificate is available',
        });
      }
      if (data.hasIncorporationCertificate === 'Yes') {
        if (!data.registrationNo || data.registrationNo.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['registrationNo'],
            message: 'CIN / Registration number is required',
          });
        }
        if (!data.dateOfIncorporation) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dateOfIncorporation'],
            message: 'Date of incorporation is required',
          });
        }
      }

      if (data.hasGstRegistration !== 'Yes' && data.hasGstRegistration !== 'No') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hasGstRegistration'],
          message: 'Select whether the vendor is GST registered',
        });
      }
      if (data.hasGstRegistration === 'Yes') {
        if (!data.gstNumber || !GST_REGEX.test(data.gstNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['gstNumber'],
            message: 'Enter a valid GSTIN',
          });
        }
        if (!data.gstRegistrationType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['gstRegistrationType'],
            message: 'GST registration type is required',
          });
        }
      }

      if (data.hasMsmeRegistration !== 'Yes' && data.hasMsmeRegistration !== 'No') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hasMsmeRegistration'],
          message: 'Select whether the vendor is MSME registered',
        });
      }
      if (data.hasMsmeRegistration === 'Yes') {
        if (!data.udyamNumber || data.udyamNumber.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['udyamNumber'],
            message: 'Udyam / MSME number is required',
          });
        }
        if (!data.enterpriseClassification) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['enterpriseClassification'],
            message: 'Enterprise classification is required',
          });
        }
      }
    }
  });

export const vendorCreateDefaults = {
  entityType: 'Proprietorship',
  legalName: '',
  hasIncorporationCertificate: 'Yes',
  dateOfIncorporation: '',
  registrationNo: '',
  aadhaarNumber: '',
  panNumber: '',
  hasGstRegistration: 'No',
  gstNumber: '',
  gstRegistrationType: 'Unregistered',
  tanNumber: '',
  hasMsmeRegistration: 'No',
  udyamNumber: '',
  enterpriseClassification: 'Micro',
  tdsSection: '194C',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
  bankName: '',
  branchName: '',
  paymentMode: '',
  contactName: '',
  phoneNumber: '',
  contactEmail: '',
  registeredAddress: '',
  state: 'Delhi',
  pincode: '',
  vendorCategory: 'Goods',
  relatedParty: 'No',
};
