import React, { useState } from 'react';
import { Box, Drawer, Tabs, Tab, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import HorizonBetaChat from './ai/HorizonBetaChat';
import RAGPanel from './ai/RAGPanel';

export const ChatSidebar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [tab, setTab] = useState<number>(2); // default KI-Chat

  return (
    <>
      <IconButton
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed',
          right: open ? 360 : 0,
          top: 160,
          zIndex: 1300,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRight: 0,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8
        }}
      >
        {open ? <ChevronRight /> : <ChevronLeft />}
      </IconButton>
      <Drawer
        anchor="right"
        variant="persistent"
        open={open}
        sx={{ '& .MuiDrawer-paper': { width: 360 } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label="Interner Chat" />
            <Tab label="WhatsApp" />
            <Tab label="KI-Chat" />
            <Tab label="RAG" />
          </Tabs>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {tab === 0 && (
              <Box sx={{ p: 2, color: 'text.secondary' }}>Interner Chat (in Arbeit)</Box>
            )}
            {tab === 1 && (
              <Box sx={{ p: 2, color: 'text.secondary' }}>WhatsApp (in Arbeit)</Box>
            )}
            {tab === 2 && (
              <Box sx={{ height: '100%' }}>
                <HorizonBetaChat />
              </Box>
            )}
            {tab === 3 && (
              <Box sx={{ height: '100%' }}>
                <RAGPanel />
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
