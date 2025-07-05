import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography
} from '@mui/material';
import {
    CheckCircle as ValidationIcon,
    Monitoring as MonitoringIcon,
    Assessment as StatisticsIcon,
    Notifications as AlertsIcon
} from '@mui/icons-material';

const ComplianceNavigation: React.FC = () => {
    const navigate = useNavigate();
    const { batchId } = useParams<{ batchId: string }>();
    
    const menuItems = [
        {
            title: 'Chargenvalidierung',
            icon: <ValidationIcon />,
            path: '/compliance/validation'
        },
        {
            title: 'Monitoring',
            icon: <MonitoringIcon />,
            path: batchId ? `/compliance/monitoring/${batchId}` : '/compliance/monitoring'
        },
        {
            title: 'Statistiken',
            icon: <StatisticsIcon />,
            path: batchId ? `/compliance/statistics/${batchId}` : '/compliance/statistics'
        },
        {
            title: 'Alert-Management',
            icon: <AlertsIcon />,
            path: batchId ? `/compliance/alerts/${batchId}` : '/compliance/alerts'
        }
    ];
    
    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <List component="nav">
                <ListItem>
                    <Typography variant="h6" color="primary">
                        Compliance
                    </Typography>
                </ListItem>
                
                <Divider />
                
                {menuItems.map((item) => (
                    <ListItem
                        key={item.title}
                        button
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.title} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default ComplianceNavigation; 