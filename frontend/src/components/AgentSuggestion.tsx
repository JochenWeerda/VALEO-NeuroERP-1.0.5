import React from 'react';
import type { AgentSuggestion as AgentSuggestionType } from '../lib/schemas';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  Chip
} from '@mui/material';
import { 
  SmartToy as RobotIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StandardButton } from './forms/FormStandardization';
import { UI_LABELS } from './ui/UIStandardization';

export interface AgentSuggestionProps {
  suggestion: AgentSuggestionType;
  onAccept: (suggestion: AgentSuggestionType) => void;
  onReject: (suggestion: AgentSuggestionType) => void;
  className?: string;
}

export const AgentSuggestion: React.FC<AgentSuggestionProps> = ({
  suggestion,
  onAccept,
  onReject,
  className
}) => {
  const handleAccept = () => {
    onAccept(suggestion);
  };

  const handleReject = () => {
    onReject(suggestion);
  };

  return (
    <Card sx={{ p: 2, border: 1, borderColor: 'divider' }} className={className}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <RobotIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium" color="text.primary">
                {suggestion.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {UI_LABELS.AI.SUGGESTION}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography variant="caption" color="text.secondary">
              {UI_LABELS.AI.CONFIDENCE}: {suggestion.confidence}%
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.primary" mb={2}>
          {suggestion.description}
        </Typography>

        {suggestion.parameters && (
          <Box mb={2} p={1.5} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="caption" fontWeight="medium" color="text.secondary" display="block" mb={1}>
              {UI_LABELS.AI.DETAILS}:
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                fontSize: '0.75rem', 
                color: 'text.secondary',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}
            >
              {JSON.stringify(suggestion.parameters, null, 2)}
            </Box>
          </Box>
        )}

        <Box display="flex" gap={1}>
          <StandardButton
            variant="contained"
            color="success"
            size="small"
            onClick={handleAccept}
            startIcon={<CheckIcon />}
            sx={{ flex: 1 }}
          >
            {UI_LABELS.ACTIONS.ACCEPT}
          </StandardButton>
          <StandardButton
            variant="contained"
            color="error"
            size="small"
            onClick={handleReject}
            startIcon={<CloseIcon />}
            sx={{ flex: 1 }}
          >
            {UI_LABELS.ACTIONS.REJECT}
          </StandardButton>
        </Box>
      </CardContent>
    </Card>
  );
}; 