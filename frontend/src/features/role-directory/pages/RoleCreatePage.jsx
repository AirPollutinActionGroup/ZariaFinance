import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GroupsIcon from '@mui/icons-material/Groups';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PageHeader, RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { roleCreateSchema, roleCreateDefaults } from '../validation/roleCreateSchema.js';
import { useCreateRole, useVerifyRoleShortName } from '../hooks/useRoles.js';
import { PERMISSION_ROLE_OPTIONS } from '../constants.js';

export function RoleCreatePage() {
  const navigate = useNavigate();
  const createRole = useCreateRole();
  const verifyShortName = useVerifyRoleShortName();
  // status: 'idle' | 'checking' | 'available' | 'taken' | 'error'; value is the
  // short name that status refers to — any edit afterwards invalidates it.
  const [shortNameCheck, setShortNameCheck] = useState({ status: 'idle', value: '' });

  const { control, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(roleCreateSchema),
    defaultValues: roleCreateDefaults,
  });

  const shortNameValue = watch('shortName');
  const shortNameVerified =
    shortNameCheck.status === 'available' && shortNameCheck.value === shortNameValue;

  const handleVerifyShortName = async () => {
    const value = shortNameValue.trim().toLowerCase();
    if (!value) return;
    setShortNameCheck({ status: 'checking', value });
    try {
      const available = await verifyShortName.mutateAsync(value);
      setShortNameCheck({ status: available ? 'available' : 'taken', value });
    } catch {
      setShortNameCheck({ status: 'error', value });
    }
  };

  const onSubmit = async (values) => {
    await createRole.mutateAsync(values);
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
                  onChange={(e) => {
                    setValue('shortName', e.target.value, { shouldValidate: true });
                    setShortNameCheck({ status: 'idle', value: '' });
                  }}
                  helperText={
                    shortNameCheck.value === shortNameValue
                      ? {
                          available: 'This short name is available.',
                          taken: 'This short name is already taken.',
                          error: 'Could not verify right now — try again.',
                        }[shortNameCheck.status]
                      : 'Click the check icon to verify it is unique.'
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={shortNameVerified ? 'Verified — click to re-check' : 'Verify availability'}>
                            <span>
                              <IconButton
                                size="small"
                                edge="end"
                                onClick={handleVerifyShortName}
                                disabled={!shortNameValue || shortNameCheck.status === 'checking'}
                              >
                                {shortNameCheck.status === 'checking' ? (
                                  <CircularProgress size={18} />
                                ) : shortNameVerified ? (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                ) : shortNameCheck.value === shortNameValue && shortNameCheck.status === 'taken' ? (
                                  <CancelIcon color="error" fontSize="small" />
                                ) : (
                                  <FactCheckOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="userLimit"
                  control={control}
                  label="User Limit"
                  placeholder="e.g. 5"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="permissionRole"
                  control={control}
                  label="Permission Role"
                  required
                  options={PERMISSION_ROLE_OPTIONS}
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
          <Tooltip title={shortNameVerified ? '' : 'Verify the role short name is unique before saving'}>
            <span>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={createRole.isPending || !shortNameVerified}
                sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
              >
                {createRole.isPending ? 'Saving…' : 'Save Role'}
              </Button>
            </span>
          </Tooltip>
        </Stack>
        {createRole.isError ? (
          <Typography color="error.main" sx={{ mt: 2, textAlign: 'right' }}>
            {createRole.error?.message || 'Failed to create role.'}
          </Typography>
        ) : null}
      </form>
    </Box>
  );
}
