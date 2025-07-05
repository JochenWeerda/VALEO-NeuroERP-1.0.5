import React from 'react';
import { 
  CheckCircle,
  Error,
  Warning,
  Info,
  Sync,
  Settings,
  Delete,
  Edit,
  Add
} from '@mui/icons-material';

export interface IconSetProps {
  name: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const IconSet: React.FC<IconSetProps> = ({ name, color = 'inherit', size = 'medium' }) => {
  const icons = {
    success: <CheckCircle color="success" fontSize={size} />,
    error: <Error color="error" fontSize={size} />,
    warning: <Warning color="warning" fontSize={size} />,
    info: <Info color="info" fontSize={size} />,
    sync: <Sync color="primary" fontSize={size} />,
    settings: <Settings fontSize={size} />,
    delete: <Delete color="error" fontSize={size} />,
    edit: <Edit color="primary" fontSize={size} />,
    add: <Add color="primary" fontSize={size} />
  };

  return icons[name] || null;
};

export default IconSet; 