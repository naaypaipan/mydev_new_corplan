import React, { useRef } from 'react';
import { Button, Box, Typography, IconButton, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

export default function FileUpload({
  files = [],
  setFiles,
  maxNumber = 10,
  title = 'อัปโหลดไฟล์',
  accept = 'image/*,.pdf',
  previewSize = 200,
}) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const remaining = maxNumber - files.length;
    const filesToAdd = selectedFiles.slice(0, remaining);

    const promises = filesToAdd.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              data_url: reader.result,
              file,
              name: file.name,
              type: file.type,
            });
          };
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(promises).then((results) => {
      setFiles([...files, ...results]);
    });

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
  };

  const isPdf = (item) => {
    if (item.type === 'application/pdf') return true;
    if (item.name && item.name.toLowerCase().endsWith('.pdf')) return true;
    if (
      item.data_url &&
      item.data_url.startsWith('data:application/pdf')
    )
      return true;
    return false;
  };

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'flex-start',
          mb: 2,
        }}
      >
        {files.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              width: previewSize,
              minHeight: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
            }}
          >
            {/* Remove button */}
            <IconButton
              size="small"
              color="error"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(255,255,255,0.9)',
                zIndex: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              }}
              onClick={() => handleRemove(index)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {isPdf(item) ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  gap: 1,
                }}
              >
                <PictureAsPdfIcon
                  sx={{ fontSize: 48, color: 'error.main' }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    wordBreak: 'break-all',
                    maxWidth: previewSize - 20,
                  }}
                >
                  {item.name || 'document.pdf'}
                </Typography>
                <Chip
                  label="PDF"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Box>
            ) : (
              <img
                src={item.data_url}
                alt={item.name || ''}
                style={{
                  width: '100%',
                  height: previewSize * 0.75,
                  objectFit: 'cover',
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {files.length < maxNumber && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            hidden
            onChange={handleFileChange}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => inputRef.current?.click()}
          >
            {title}
          </Button>
        </>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  setFiles: PropTypes.func.isRequired,
  maxNumber: PropTypes.number,
  title: PropTypes.string,
  accept: PropTypes.string,
  previewSize: PropTypes.number,
};
