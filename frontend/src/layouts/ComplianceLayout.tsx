import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import ComplianceNavigation from '../components/compliance/ComplianceNavigation';

const ComplianceLayout: React.FC = () => {
    return (
        <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12} md={3} lg={2} sx={{ borderRight: 1, borderColor: 'divider' }}>
                    <ComplianceNavigation />
                </Grid>
                <Grid item xs={12} md={9} lg={10} sx={{ height: '100%', overflow: 'auto' }}>
                    <Outlet />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ComplianceLayout; 