import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Input } from '@mui/material';

const MobileUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Mobiler Upload</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Input type="file" onChange={handleFileChange} />
        {file && (
          <Box mt={2}>
            <Typography variant="body2">Ausgewählte Datei: {file.name}</Typography>
          </Box>
        )}
        <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!file}>Hochladen</Button>
      </Paper>
    </Box>
  );
};

export default MobileUploadPage; 