import React, { useState } from 'react';
import { 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  LocalOffer as OfferIcon,
  ShoppingCart as OrderIcon,
  Receipt as InvoiceIcon,
  AttachFile as DocumentIcon,
  PersonAdd as ContactIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  Customer, 
  CRMMainTab, 
  CRMSubTab,
  CRMRibbonAction 
} from '../../types/crm';

interface CRMContextMenuProps {
  customer?: Customer | null;
  currentTab: CRMMainTab;
  currentSubTab: CRMSubTab;
  onAction?: (action: CRMRibbonAction, context?: any) => void;
}

const CRMContextMenu: React.FC<CRMContextMenuProps> = ({
  customer,
  currentTab,
  currentSubTab,
  onAction
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextData, setContextData] = useState<any>(null);

  const handleContextMenu = (event: React.MouseEvent, data?: any) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget as HTMLElement);
    setContextData(data);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setContextData(null);
  };

  const handleAction = (action: CRMRibbonAction) => {
    onAction?.(action, contextData);
    handleClose();
  };

  // Kontext-Menü-Konfiguration basierend auf aktuellem Tab
  const getContextMenuItems = () => {
    const baseItems = [
      {
        label: 'Bearbeiten',
        icon: <EditIcon />,
        action: CRMRibbonAction.EDIT,
        enabled: !!customer
      },
      {
        label: 'Anzeigen',
        icon: <ViewIcon />,
        action: CRMRibbonAction.DETAIL_VIEW,
        enabled: !!customer
      },
      {
        label: 'Drucken',
        icon: <PrintIcon />,
        action: CRMRibbonAction.PRINT,
        enabled: !!customer
      }
    ];

    // Tab-spezifische Menüpunkte
    switch (currentTab) {
             case CRMMainTab.GENERAL:
         baseItems.push(
           {
             label: 'Kontakt aufnehmen',
             icon: <PhoneIcon />,
             action: 'CONTACT_CUSTOMER' as CRMRibbonAction,
             enabled: !!customer?.phone
           },
           {
             label: 'E-Mail senden',
             icon: <EmailIcon />,
             action: 'SEND_EMAIL' as CRMRibbonAction,
             enabled: !!customer?.email
           },
           {
             label: 'WhatsApp senden',
             icon: <WhatsAppIcon />,
             action: CRMRibbonAction.SEND_WHATSAPP,
             enabled: !!customer?.whatsapp
           },
           {
             label: 'Termin planen',
             icon: <ScheduleIcon />,
             action: 'SCHEDULE_MEETING' as CRMRibbonAction,
             enabled: !!customer
           }
         );
        break;

      case CRMMainTab.CONTACTS:
        baseItems.push(
          {
            label: 'Neuen Kontakt hinzufügen',
            icon: <ContactIcon />,
            action: CRMRibbonAction.ADD_CONTACT,
            enabled: !!customer
          },
          {
            label: 'Kontakte exportieren',
            icon: <DownloadIcon />,
            action: CRMRibbonAction.EXPORT,
            enabled: !!customer
          }
        );
        break;

      case CRMMainTab.SALES:
        baseItems.push(
          {
            label: 'Neues Angebot erstellen',
            icon: <OfferIcon />,
            action: CRMRibbonAction.ADD_OFFER,
            enabled: !!customer
          },
          {
            label: 'Neuen Auftrag erstellen',
            icon: <OrderIcon />,
            action: CRMRibbonAction.ADD_ORDER,
            enabled: !!customer
          },
          {
            label: 'Vertriebsanalyse',
            icon: <AnalyticsIcon />,
            action: CRMRibbonAction.ANALYZE,
            enabled: !!customer
          }
        );
        break;

      case CRMMainTab.ORDERS:
        baseItems.push(
          {
            label: 'Neuen Auftrag erstellen',
            icon: <OrderIcon />,
            action: CRMRibbonAction.ADD_ORDER,
            enabled: !!customer
          },
          {
            label: 'Auftragsbericht',
            icon: <ReportIcon />,
            action: CRMRibbonAction.REPORT,
            enabled: !!customer
          }
        );
        break;

      case CRMMainTab.INVOICES:
        baseItems.push(
          {
            label: 'Neue Rechnung erstellen',
            icon: <InvoiceIcon />,
            action: 'CREATE_INVOICE' as CRMRibbonAction,
            enabled: !!customer
          },
          {
            label: 'Zahlungserinnerung',
            icon: <EmailIcon />,
            action: 'SEND_REMINDER' as CRMRibbonAction,
            enabled: !!customer
          }
        );
        break;

      case CRMMainTab.DOCUMENTS:
        baseItems.push(
          {
            label: 'Dokument hinzufügen',
            icon: <DocumentIcon />,
            action: CRMRibbonAction.ADD_DOCUMENT,
            enabled: !!customer
          },
          {
            label: 'Dokumente teilen',
            icon: <ShareIcon />,
            action: 'SHARE_DOCUMENTS' as CRMRibbonAction,
            enabled: !!customer
          },
          {
            label: 'Dokumente herunterladen',
            icon: <DownloadIcon />,
            action: CRMRibbonAction.EXPORT,
            enabled: !!customer
          }
        );
        break;

      case CRMMainTab.ANALYSIS:
        baseItems.push(
          {
            label: 'Analyse exportieren',
            icon: <DownloadIcon />,
            action: CRMRibbonAction.EXPORT,
            enabled: !!customer
          },
          {
            label: 'Bericht erstellen',
            icon: <ReportIcon />,
            action: CRMRibbonAction.REPORT,
            enabled: !!customer
          }
        );
        break;

      case CRMMainTab.SUPPLIERS:
        baseItems.push(
          {
            label: 'Neuen Lieferanten hinzufügen',
            icon: <AddIcon />,
            action: 'ADD_SUPPLIER' as CRMRibbonAction,
            enabled: !!customer
          },
          {
            label: 'Lieferantenanalyse',
            icon: <AnalyticsIcon />,
            action: CRMRibbonAction.ANALYZE,
            enabled: !!customer
          }
        );
        break;

      default:
        break;
    }

    // Allgemeine Aktionen am Ende
    baseItems.push(
      {
        label: 'Duplizieren',
        icon: <DuplicateIcon />,
        action: CRMRibbonAction.DUPLICATE,
        enabled: !!customer
      },
      {
        label: 'Löschen',
        icon: <DeleteIcon />,
        action: CRMRibbonAction.DELETE,
        enabled: !!customer
      }
    );

    return baseItems;
  };

  const menuItems = getContextMenuItems();

  return (
    <>
      {/* Kontext-Menü-Trigger (versteckt, wird über onContextMenu aufgerufen) */}
      <Box
        onContextMenu={(e) => handleContextMenu(e)}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Kontext-Menü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className="min-w-48"
      >
        {/* Kunden-Info Header */}
        {customer && (
          <>
            <Box className="px-4 py-2 bg-gray-50 border-b">
              <Typography variant="subtitle2" className="font-medium text-gray-800">
                {customer.name}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {customer.customerNumber}
              </Typography>
            </Box>
            <Divider />
          </>
        )}

        {/* Menüpunkte */}
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleAction(item.action)}
            disabled={!item.enabled}
            className={`${item.enabled ? 'text-gray-700' : 'text-gray-400'}`}
          >
            <ListItemIcon className={item.enabled ? 'text-gray-600' : 'text-gray-400'}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}

        {/* Einstellungen */}
        <Divider />
        <MenuItem
          onClick={() => handleAction(CRMRibbonAction.SETTINGS)}
          className="text-gray-700"
        >
          <ListItemIcon className="text-gray-600">
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Einstellungen" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default CRMContextMenu; 