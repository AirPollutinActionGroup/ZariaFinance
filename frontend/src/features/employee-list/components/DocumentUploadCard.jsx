import { useRef, useState } from 'react';
import { Box, Button, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloseIcon from '@mui/icons-material/Close';

const ACCEPT = '.pdf,.jpg,.jpeg,.png';
const MAX_BYTES = 5 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * One document slot (e.g. PAN Card): an empty drop/click area, or the file's
 * name and size with Replace / Remove. `value` is a newly chosen File, an
 * already-uploaded document ({ fileName, sizeBytes, url, stored: true }) —
 * shown with a View link — or null.
 * Only PDF, JPG and PNG up to 5 MB are accepted.
 */
export function DocumentUploadCard({ title, hint, value, onChange, required = false }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const pick = (file) => {
    if (!file) return;
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) {
      setError('Only PDF, JPG or PNG files.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is larger than 5 MB.');
      return;
    }
    setError(null);
    onChange(file);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
        {title}
        {required ? (
          <Box component="span" sx={{ color: 'error.main' }}>
            {' '}*
          </Box>
        ) : null}
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {value ? (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <InsertDriveFileOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={value.stored ? value.fileName : value.name}>
              {value.stored ? value.fileName : value.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatSize(value.stored ? value.sizeBytes : value.size)}
              {value.stored ? ' · uploaded' : ' · will upload on save'}
            </Typography>
          </Box>
          {value.stored && value.url ? (
            <Link href={value.url} target="_blank" rel="noopener noreferrer" underline="hover" variant="body2" sx={{ fontWeight: 600 }}>
              View
            </Link>
          ) : null}
          <Button size="small" onClick={openPicker}>
            Replace
          </Button>
          <Tooltip title="Remove">
            <IconButton size="small" aria-label={`Remove ${title}`} onClick={() => onChange(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <Box
          role="button"
          tabIndex={0}
          aria-label={`Upload ${title}`}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            cursor: 'pointer',
            borderRadius: 2,
            border: '1.5px dashed',
            borderColor: error ? 'error.main' : dragging ? 'text.primary' : 'divider',
            bgcolor: dragging ? 'action.hover' : 'transparent',
            transition: 'border-color 0.15s, background-color 0.15s',
            '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'action.hover',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <CloudUploadOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Click to upload or drag a file here
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hint || 'PDF, JPG or PNG · up to 5 MB'}
            </Typography>
          </Box>
        </Box>
      )}

      {error ? (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
