import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PageHeader } from '../../../shared/components/index.js';
import { MOCK_ORGANISATIONS } from '../data/mockOrganisations.js';

function DetailField({ label, value, isLink = false }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      {isLink && value ? (
        <Link href={value} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontWeight: 600 }}>
          {value}
        </Link>
      ) : (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || '—'}
        </Typography>
      )}
    </Grid>
  );
}

export function OrganisationRegisterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const org = MOCK_ORGANISATIONS.find((o) => o.id === id) || MOCK_ORGANISATIONS[0];

  let statusColor = 'default';
  if (org.status === 'Active') statusColor = 'success';
  else if (org.status === 'Pending') statusColor = 'warning';
  else if (org.status === 'Inactive') statusColor = 'error';

  return (
    <Box>
      <PageHeader
        title={org.name}
        subtitle={`${org.shortName} · ${org.city}, ${org.state}`}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/organisation-register')}
          >
            Back to List
          </Button>
        }
      />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* SECTION 1: ORGANISATION INFORMATION */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Organisation Details
            </Typography>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <DetailField label="ORGANISATION NAME" value={org.name} />
            <DetailField label="ORGANISATION SHORT NAME" value={org.shortName} />
            <DetailField label="EMAIL" value={org.email} />
            <DetailField label="PHONE NO" value={org.phone} />
            <DetailField label="WEB URL" value={org.webUrl} isLink />
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                STATUS
              </Typography>
              <Chip
                label={org.status}
                color={statusColor}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, minWidth: 80 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* SECTION 2: ADDRESS & LOCATION DETAILS */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Address & Location Details
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <DetailField label="ADDRESS 1" value={org.address1} />
            <DetailField label="ADDRESS 2" value={org.address2} />
            <DetailField label="CITY" value={org.city} />
            <DetailField label="STATE" value={org.state} />
            <DetailField label="ZIP CODE" value={org.zipCode} />
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
