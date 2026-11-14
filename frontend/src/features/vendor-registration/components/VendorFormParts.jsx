import { Controller } from 'react-hook-form';
import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  FormHelperText,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloseIcon from '@mui/icons-material/Close';

/** Section card: hairline card with a one-line numbered header and a status marker. */
export function FormSection({ id, number, title, description, status, children }) {
  return (
    <Card variant="outlined" id={id} sx={{ scrollMarginTop: 72 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
          <Typography
            variant="overline"
            sx={{ lineHeight: '22px', color: 'text.secondary', minWidth: 20 }}
          >
            {number}
          </Typography>
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: '22px' }}>
              {title}
            </Typography>
            {description ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {description}
              </Typography>
            ) : null}
          </Box>
          <SectionStatus status={status} />
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

// On narrow screens only the icon shows, so the chip doesn't crowd the title.
const statusChipSx = {
  flexShrink: 0,
  '& .MuiChip-label': { display: { xs: 'none', sm: 'block' } },
  '& .MuiChip-icon': { mx: { xs: 0.5, sm: '4px -6px 0 4px' } },
};

function SectionStatus({ status }) {
  if (status === 'error') {
    return (
      <Chip size="small" color="error" variant="outlined" icon={<ErrorOutlineIcon />} label="Needs attention" sx={statusChipSx} />
    );
  }
  if (status === 'complete') {
    return (
      <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Complete" sx={statusChipSx} />
    );
  }
  return null;
}

/**
 * Yes / No question as a compact segmented control rather than a dropdown —
 * one click instead of two, and the answer is visible at a glance.
 */
export function RhfYesNo({ name, control, label, helperText, required = false }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{
              pl: 1.75,
              pr: 1,
              py: 0.75,
              minHeight: 56,
              border: '1px solid',
              borderColor: fieldState.error ? 'error.main' : 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" noWrap sx={{ fontWeight: 500, minWidth: 0 }}>
              {label}
              {required ? ' *' : ''}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={field.value ?? null}
              onChange={(_e, next) => {
                if (next !== null) field.onChange(next);
              }}
              aria-label={label}
            >
              <ToggleButton value="Yes" sx={{ px: 1.25, py: 0.25 }}>Yes</ToggleButton>
              <ToggleButton value="No" sx={{ px: 1.25, py: 0.25 }}>No</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <FormHelperText error={Boolean(fieldState.error)} sx={{ mx: 1.75 }}>
            {fieldState.error?.message || helperText || ' '}
          </FormHelperText>
        </Box>
      )}
    />
  );
}

/** Large selectable card used for the Individual / Organisation choice. */
export function ChoiceCard({ selected, icon: Icon, title, description, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        width: '100%',
        textAlign: 'left',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.75,
        borderRadius: 1,
        border: '1px solid',
        borderColor: selected ? 'text.primary' : 'divider',
        boxShadow: (theme) => (selected ? `inset 0 0 0 1px ${theme.palette.text.primary}` : 'none'),
        bgcolor: selected ? 'action.selected' : 'transparent',
        transition: 'border-color .15s, background-color .15s',
        '&:hover': { borderColor: 'text.primary' },
      }}
    >
      <Icon sx={{ fontSize: 22, mt: 0.25, color: selected ? 'text.primary' : 'text.secondary' }} />
      <Box flex={1}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      {selected ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : null}
    </ButtonBase>
  );
}

/** Upload tile for one supporting document. */
export function DocumentTile({ label, fileName, onSelect, onRemove }) {
  const done = Boolean(fileName);
  return (
    <Box
      component="label"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        p: 1.5,
        minHeight: 64,
        borderRadius: 1,
        border: '1px dashed',
        borderStyle: done ? 'solid' : 'dashed',
        borderColor: done ? 'success.main' : 'divider',
        cursor: 'pointer',
        transition: 'border-color .15s, background-color .15s',
        '&:hover': { borderColor: done ? 'success.main' : 'text.primary', bgcolor: 'action.hover' },
      }}
    >
      {done ? (
        <InsertDriveFileOutlinedIcon color="success" />
      ) : (
        <UploadFileOutlinedIcon sx={{ color: 'text.secondary' }} />
      )}
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="caption" color={done ? 'success.main' : 'text.secondary'} noWrap sx={{ display: 'block' }}>
          {fileName || 'Click to upload · PDF, JPG or PNG'}
        </Typography>
      </Box>
      {done ? (
        <Tooltip title="Remove">
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
      <input
        type="file"
        hidden
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = '';
        }}
      />
    </Box>
  );
}
