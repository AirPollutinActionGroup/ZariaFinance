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
    dateOfIncorporation: z.string().optional(),
    registrationNo: z.string().optional(),
    aadhaarNumber: z.string().optional(),

    // Tax & Statutory
    panNumber: z.string().regex(PAN_REGEX, 'Enter a valid PAN (e.g. ABCDE1234F)'),
    gstNumber: z
      .string()
      .optional()
      .refine((val) => !val || GST_REGEX.test(val), 'Enter a valid GSTIN'),
    gstRegistrationType: z.enum(['Regular', 'Composition', 'Unregistered', 'SEZ'], {
      errorMap: () => ({ message: 'GST registration type is required' }),
    }),
    tanNumber: z.string().optional(),
    udyamNumber: z.string().optional(),
    tdsSection: z.enum(['194C', '194J'], {
      errorMap: () => ({ message: 'TDS applicable section is required' }),
    }),

    // Banking
    accountNumber: z.string().min(4, 'Account number is required'),
    ifscCode: z.string().regex(IFSC_REGEX, 'Enter a valid IFSC code'),
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    paymentMode: z.enum(['NEFT', 'RTGS', 'UPI', 'Cheque'], {
      errorMap: () => ({ message: 'Payment mode preference is required' }),
    }),

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
    status: z.enum(['Active', 'Inactive']).default('Active'),
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
  });

export const vendorCreateDefaults = {
  entityType: 'Proprietorship',
  legalName: '',
  dateOfIncorporation: '',
  registrationNo: '',
  aadhaarNumber: '',
  panNumber: '',
  gstNumber: '',
  gstRegistrationType: 'Unregistered',
  tanNumber: '',
  udyamNumber: '',
  tdsSection: '194C',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
  bankName: '',
  branchName: '',
  paymentMode: 'NEFT',
  contactName: '',
  phoneNumber: '',
  contactEmail: '',
  registeredAddress: '',
  state: 'Delhi',
  pincode: '',
  vendorCategory: 'Goods',
  status: 'Active',
};
