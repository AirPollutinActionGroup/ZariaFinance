import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GroupsIcon from '@mui/icons-material/Groups';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader, RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import { roleCreateSchema, roleCreateDefaults } from '../validation/roleCreateSchema.js';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export function RoleCreatePage() {
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(roleCreateSchema),
    defaultValues: roleCreateDefaults,
  });

  const onSubmit = (values) => {
    console.log('Creating Role:', values);
    alert(`Role "${values.roleName}" created successfully!`);
    navigate('/role-directory');
  };

  return (
    <Box>
      <PageHeader
        title="Create New Role"
        subtitle="Fill in the details below to add a new organisational role."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/role-directory')}
          >
            Back to List
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={2.5}
              alignItems="center"
              sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  fontWeight: 700,
                  borderRadius: 3,
                }}
              >
                <GroupsIcon sx={{ fontSize: 30 }} />
              </Avatar>

              <Box flex={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Role Information
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Define the role name and short code.
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="roleName"
                  control={control}
                  label="Role Name"
                  placeholder="e.g. Chief Financial Officer"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="shortName"
                  control={control}
                  label="Short Name"
                  placeholder="e.g. CFO"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="status"
                  control={control}
                  label="Status"
                  required
                  options={STATUS_OPTIONS}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* BOTTOM ACTION BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/role-directory')}
            sx={{ px: 3, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            Save Role
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
