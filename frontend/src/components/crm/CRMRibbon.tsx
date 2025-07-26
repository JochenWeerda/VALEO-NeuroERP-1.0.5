import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  IconButton, 
  Divider, 
  Box, 
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Upload as ImportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddContactIcon,
  AttachFile as AddDocumentIcon,
  LocalOffer as AddOfferIcon,
  ShoppingCart as AddOrderIcon,
  WhatsApp as WhatsAppIcon,
  ViewList as DetailViewIcon,
  ViewModule as ListViewIcon,
  ViewQuilt as CardViewIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Analytics as AnalyzeIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Backup as BackupIcon,
  Help as HelpIcon,
  Info as AboutIcon,
  Support as SupportIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { 
  CRMRibbonSection, 
  CRMRibbonAction, 
  CRMFunctionalRibbon,
  Customer,
  CRMMainTab,
  CRMSubTab
} from '../../types/crm';

interface CRMRibbonProps {
  customer?: Customer | null;
  currentTab: CRMMainTab;
  currentSubTab: CRMSubTab;
  onAction?: (action: CRMRibbonAction) => void;
}

const CRMRibbon: React.FC<CRMRibbonProps> = ({
  customer,
  currentTab,
  currentSubTab,
  onAction
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: CRMRibbonAction) => {
    onAction?.(action);
    handleMenuClose();
  };

  // Ribbon-Konfiguration basierend auf aktuellem Tab
  const getRibbonConfig = (): CRMFunctionalRibbon[] => {
    const baseConfig: CRMFunctionalRibbon[] = [
      {
        section: CRMRibbonSection.FILE,
        actions: [
          CRMRibbonAction.NEW_CUSTOMER,
          CRMRibbonAction.SAVE,
          CRMRibbonAction.PRINT,
          CRMRibbonAction.EXPORT,
          CRMRibbonAction.IMPORT
        ],
        isEnabled: true,
        isVisible: true
      },
      {
        section: CRMRibbonSection.HOME,
        actions: [
          CRMRibbonAction.EDIT,
          CRMRibbonAction.DELETE,
          CRMRibbonAction.DUPLICATE,
          CRMRibbonAction.REFRESH
        ],
        isEnabled: !!customer,
        isVisible: true
      }
    ];

    // Tab-spezifische Aktionen
    switch (currentTab) {
      case CRMMainTab.CONTACTS:
        baseConfig.push({
          section: CRMRibbonSection.INSERT,
          actions: [CRMRibbonAction.ADD_CONTACT],
          isEnabled: !!customer,
          isVisible: true
        });
        break;
      
      case CRMMainTab.SALES:
        baseConfig.push({
          section: CRMRibbonSection.INSERT,
          actions: [
            CRMRibbonAction.ADD_OFFER,
            CRMRibbonAction.ADD_ORDER
          ],
          isEnabled: !!customer,
          isVisible: true
        });
        break;
      
      case CRMMainTab.DOCUMENTS:
        baseConfig.push({
          section: CRMRibbonSection.INSERT,
          actions: [CRMRibbonAction.ADD_DOCUMENT],
          isEnabled: !!customer,
          isVisible: true
        });
        break;
      
      default:
        break;
    }

    // View-Sektion immer hinzufügen
    baseConfig.push({
      section: CRMRibbonSection.VIEW,
      actions: [
        CRMRibbonAction.DETAIL_VIEW,
        CRMRibbonAction.LIST_VIEW,
        CRMRibbonAction.CARD_VIEW,
        CRMRibbonAction.FILTER,
        CRMRibbonAction.SORT
      ],
      isEnabled: true,
      isVisible: true
    });

    // Tools-Sektion
    baseConfig.push({
      section: CRMRibbonSection.TOOLS,
      actions: [
        CRMRibbonAction.ANALYZE,
        CRMRibbonAction.REPORT,
        CRMRibbonAction.SETTINGS,
        CRMRibbonAction.BACKUP
      ],
      isEnabled: true,
      isVisible: true
    });

    // Help-Sektion
    baseConfig.push({
      section: CRMRibbonSection.HELP,
      actions: [
        CRMRibbonAction.HELP,
        CRMRibbonAction.ABOUT,
        CRMRibbonAction.SUPPORT
      ],
      isEnabled: true,
      isVisible: true
    });

    return baseConfig;
  };

  const getActionIcon = (action: CRMRibbonAction) => {
    const iconMap: Record<CRMRibbonAction, React.ReactElement> = {
      [CRMRibbonAction.NEW_CUSTOMER]: <AddIcon />,
      [CRMRibbonAction.SAVE]: <SaveIcon />,
      [CRMRibbonAction.PRINT]: <PrintIcon />,
      [CRMRibbonAction.EXPORT]: <ExportIcon />,
      [CRMRibbonAction.IMPORT]: <ImportIcon />,
      [CRMRibbonAction.EDIT]: <EditIcon />,
      [CRMRibbonAction.DELETE]: <DeleteIcon />,
      [CRMRibbonAction.DUPLICATE]: <DuplicateIcon />,
      [CRMRibbonAction.REFRESH]: <RefreshIcon />,
      [CRMRibbonAction.ADD_CONTACT]: <AddContactIcon />,
      [CRMRibbonAction.ADD_DOCUMENT]: <AddDocumentIcon />,
      [CRMRibbonAction.ADD_OFFER]: <AddOfferIcon />,
      [CRMRibbonAction.ADD_ORDER]: <AddOrderIcon />,
      [CRMRibbonAction.SEND_WHATSAPP]: <WhatsAppIcon />,
      [CRMRibbonAction.DETAIL_VIEW]: <DetailViewIcon />,
      [CRMRibbonAction.LIST_VIEW]: <ListViewIcon />,
      [CRMRibbonAction.CARD_VIEW]: <CardViewIcon />,
      [CRMRibbonAction.FILTER]: <FilterIcon />,
      [CRMRibbonAction.SORT]: <SortIcon />,
      [CRMRibbonAction.ANALYZE]: <AnalyzeIcon />,
      [CRMRibbonAction.REPORT]: <ReportIcon />,
      [CRMRibbonAction.SETTINGS]: <SettingsIcon />,
      [CRMRibbonAction.BACKUP]: <BackupIcon />,
      [CRMRibbonAction.HELP]: <HelpIcon />,
      [CRMRibbonAction.ABOUT]: <AboutIcon />,
      [CRMRibbonAction.SUPPORT]: <SupportIcon />
    };
    return iconMap[action] || <MoreIcon />;
  };

  const getActionLabel = (action: CRMRibbonAction): string => {
    const labels: Record<CRMRibbonAction, string> = {
      [CRMRibbonAction.NEW_CUSTOMER]: 'Neuer Kunde',
      [CRMRibbonAction.SAVE]: 'Speichern',
      [CRMRibbonAction.PRINT]: 'Drucken',
      [CRMRibbonAction.EXPORT]: 'Exportieren',
      [CRMRibbonAction.IMPORT]: 'Importieren',
      [CRMRibbonAction.EDIT]: 'Bearbeiten',
      [CRMRibbonAction.DELETE]: 'Löschen',
      [CRMRibbonAction.DUPLICATE]: 'Duplizieren',
      [CRMRibbonAction.REFRESH]: 'Aktualisieren',
      [CRMRibbonAction.ADD_CONTACT]: 'Kontakt hinzufügen',
      [CRMRibbonAction.ADD_DOCUMENT]: 'Dokument hinzufügen',
      [CRMRibbonAction.ADD_OFFER]: 'Angebot erstellen',
      [CRMRibbonAction.ADD_ORDER]: 'Auftrag erstellen',
      [CRMRibbonAction.SEND_WHATSAPP]: 'WhatsApp senden',
      [CRMRibbonAction.DETAIL_VIEW]: 'Detailansicht',
      [CRMRibbonAction.LIST_VIEW]: 'Listenansicht',
      [CRMRibbonAction.CARD_VIEW]: 'Kartenansicht',
      [CRMRibbonAction.FILTER]: 'Filter',
      [CRMRibbonAction.SORT]: 'Sortieren',
      [CRMRibbonAction.ANALYZE]: 'Analysieren',
      [CRMRibbonAction.REPORT]: 'Bericht',
      [CRMRibbonAction.SETTINGS]: 'Einstellungen',
      [CRMRibbonAction.BACKUP]: 'Backup',
      [CRMRibbonAction.HELP]: 'Hilfe',
      [CRMRibbonAction.ABOUT]: 'Über',
      [CRMRibbonAction.SUPPORT]: 'Support'
    };
    return labels[action] || action;
  };

  const getSectionLabel = (section: CRMRibbonSection): string => {
    const labels: Record<CRMRibbonSection, string> = {
      [CRMRibbonSection.FILE]: 'Datei',
      [CRMRibbonSection.HOME]: 'Start',
      [CRMRibbonSection.INSERT]: 'Einfügen',
      [CRMRibbonSection.VIEW]: 'Ansicht',
      [CRMRibbonSection.TOOLS]: 'Tools',
      [CRMRibbonSection.HELP]: 'Hilfe'
    };
    return labels[section] || section;
  };

  const ribbonConfig = getRibbonConfig();

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      className="bg-white border-b border-gray-200"
    >
      <Toolbar className="px-4 py-2 min-h-16">
        {/* Kunden-Info */}
        {customer && (
          <Box className="flex items-center mr-6">
            <Typography variant="h6" className="text-gray-800 mr-2">
              {customer.name}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              ({customer.customerNumber})
            </Typography>
          </Box>
        )}

        {/* Ribbon-Sektionen */}
        <Box className="flex items-center space-x-4 flex-1">
          {ribbonConfig
            .filter(ribbon => ribbon.isVisible)
            .map((ribbon) => (
              <Box key={ribbon.section} className="flex items-center space-x-2">
                {/* Sektions-Label */}
                <Typography 
                  variant="caption" 
                  className="text-gray-600 font-medium px-2 py-1 bg-gray-100 rounded"
                >
                  {getSectionLabel(ribbon.section)}
                </Typography>

                {/* Aktionen */}
                <Box className="flex items-center space-x-1">
                  {ribbon.actions.map((action) => {
                    const isEnabled = ribbon.isEnabled;
                    
                    return (
                      <Tooltip 
                        key={action} 
                        title={getActionLabel(action)}
                        placement="bottom"
                      >
                        <IconButton
                          size="small"
                          disabled={!isEnabled}
                          onClick={() => handleAction(action)}
                          className={`p-2 ${isEnabled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400'}`}
                        >
                          {getActionIcon(action)}
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Box>

                <Divider orientation="vertical" flexItem />
              </Box>
            ))}
        </Box>

        {/* Benachrichtigungen */}
        <Box className="flex items-center space-x-2">
          <Badge badgeContent={3} color="error">
            <IconButton size="small" className="text-gray-700">
              <Typography variant="body2">⚠️</Typography>
            </IconButton>
          </Badge>
          
          <Badge badgeContent={5} color="primary">
            <IconButton size="small" className="text-gray-700">
              <Typography variant="body2">📧</Typography>
            </IconButton>
          </Badge>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CRMRibbon; 