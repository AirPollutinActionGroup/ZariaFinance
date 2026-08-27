import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { ConfirmDialog, PageHeader } from '../../../shared/components/index.js';
import { MOCK_VENDORS } from '../data/mockVendors.js';

function DetailField({ label, value, chip = null }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography
        variant="caption"
        component="p"
        color="text.secondary"
        sx={{ fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
      >
        {label}
      </Typography>
      {chip || (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || '—'}
        </Typography>
      )}
    </Grid>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
      {children}
    </Typography>
  );
}

export function VendorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const vendorRecord =
    MOCK_VENDORS.find((v) => v.id === id || v.vendorCode.toLowerCase() === id?.toLowerCase()) ||
    MOCK_VENDORS[0];

  const [status, setStatus] = useState(vendorRecord.status || 'Active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const isIndividual = vendorRecord.entityType === 'Individual';

  const handleConfirmStatusChange = () => {
    const nextStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(nextStatus);
    vendorRecord.status = nextStatus;
    setDialogOpen(false);
  };

  const isActive = status === 'Active';

  const dialogDescription = isActive
    ? 'Are you sure you want to change the status of this vendor from active to inactive?'
    : 'Are you sure you want to change the status of this vendor from inactive to active?';

  return (
    <Box>
      <PageHeader
        title={vendorRecord.legalName}
        subtitle={`${vendorRecord.vendorCode} · ${vendorRecord.entityType} · ${vendorRecord.vendorCategory}`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color={isActive ? 'warning' : 'success'}
              onClick={() => setDialogOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              {isActive ? 'Mark Inactive' : 'Mark Active'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vendor-registration')}
            >
              Back to List
            </Button>
          </Stack>
        }
      />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <StorefrontIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {vendorRecord.legalName}
                </Typography>
                <Chip
                  label={status}
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Entity Type determines which identification, tax and document fields apply.
              </Typography>
            </Box>
            <Chip
              label={vendorRecord.vendorCode}
              variant="outlined"
              sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, px: 0.5 }}
            />
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Identification</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="Entity Type" value={vendorRecord.entityType} />
            <DetailField label="Legal Name" value={vendorRecord.legalName} />
            {isIndividual ? (
              <DetailField label="Aadhaar Number" value={vendorRecord.aadhaarNumber} />
            ) : (
              <>
                <DetailField label="Date of Incorporation" value={vendorRecord.dateOfIncorporation} />
                <DetailField label="CIN / Registration No." value={vendorRecord.registrationNo} />
              </>
            )}
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Tax &amp; Statutory</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="PAN Number" value={vendorRecord.panNumber} />
            {!isIndividual && (
              <>
                <DetailField label="GST Number" value={vendorRecord.gstNumber || 'Not registered'} />
                <DetailField label="GST Registration Type" value={vendorRecord.gstRegistrationType} />
                <DetailField label="TAN Number" value={vendorRecord.tanNumber || '—'} />
                <DetailField label="Udyam / MSME Number" value={vendorRecord.udyamNumber || '—'} />
              </>
            )}
            <DetailField label="TDS Applicable Section" value={vendorRecord.tdsSection} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Banking Detail</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="Account Number" value={vendorRecord.accountNumber} />
            <DetailField label="IFSC Code" value={vendorRecord.ifscCode} />
            <DetailField label="Account Holder Name" value={vendorRecord.accountHolderName} />
            <DetailField label="Bank Name" value={vendorRecord.bankName} />
            <DetailField label="Branch Name" value={vendorRecord.branchName} />
            <DetailField label="Payment Mode Preference" value={vendorRecord.paymentMode} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Contact &amp; Address</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="Contact Name" value={vendorRecord.contactName} />
            <DetailField label="Phone Number" value={vendorRecord.phoneNumber} />
            <DetailField label="Contact Email" value={vendorRecord.contactEmail} />
            <DetailField label="Registered Address" value={vendorRecord.registeredAddress} />
            <DetailField label="State" value={vendorRecord.state} />
            <DetailField label="Pincode" value={vendorRecord.pincode} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Classification &amp; Workflow</SectionTitle>
          <Grid container spacing={3}>
            <DetailField
              label="Vendor Category"
              value={vendorRecord.vendorCategory}
              chip={
                <Chip
                  label={vendorRecord.vendorCategory}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              }
            />
            <DetailField
              label="Status"
              value={status}
              chip={
                <Chip
                  label={status}
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 70 }}
                />
              }
            />
          </Grid>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        title="Change Vendor Status"
        description={dialogDescription}
        confirmLabel="Confirm"
        confirmColor={isActive ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
