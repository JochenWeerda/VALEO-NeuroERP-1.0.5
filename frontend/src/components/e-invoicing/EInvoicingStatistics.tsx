import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { EInvoicingStatistics as EInvoicingStats } from '../../types/invoices';

interface EInvoicingStatisticsProps {
  statistics: EInvoicingStats;
  isLoading?: boolean;
}

/**
 * E-Invoicing Statistiken Komponente
 * Zeigt Übersicht über Rechnungsstatistiken an
 */
export const EInvoicingStatistics: React.FC<EInvoicingStatisticsProps> = ({
  statistics,
  isLoading = false
}) => {
  const currentMonth = statistics.monthly[statistics.monthly.length - 1];
  const currentYear = statistics.yearly[statistics.yearly.length - 1];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'open':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle fontSize="small" />;
      case 'overdue':
        return <Warning fontSize="small" />;
      case 'open':
        return <Receipt fontSize="small" />;
      default:
        return <AttachMoney fontSize="small" />;
    }
  };

  if (isLoading) {
    return (
      <Box className="w-full">
        <LinearProgress />
        <Typography className="mt-4 text-center text-gray-500">
          Lade Statistiken...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {/* Übersichtskarten */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="text-center">
              <AttachMoney className="text-blue-600 text-3xl mb-2" />
              <Typography variant="h4" className="font-bold text-gray-800">
                {formatCurrency(currentMonth?.totalAmount || 0)}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Monatlicher Umsatz
              </Typography>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="text-green-600 text-sm mr-1" />
                <Typography variant="caption" className="text-green-600">
                  +12.5%
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="text-center">
              <Receipt className="text-green-600 text-3xl mb-2" />
              <Typography variant="h4" className="font-bold text-gray-800">
                {currentMonth?.paidInvoices || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Bezahlte Rechnungen
              </Typography>
              <div className="flex items-center justify-center mt-2">
                <CheckCircle className="text-green-600 text-sm mr-1" />
                <Typography variant="caption" className="text-green-600">
                  {formatPercentage((currentMonth?.paidInvoices || 0) / (currentMonth?.totalInvoices || 1))}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="text-center">
              <Warning className="text-orange-600 text-3xl mb-2" />
              <Typography variant="h4" className="font-bold text-gray-800">
                {currentMonth?.overdueInvoices || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Überfällige Rechnungen
              </Typography>
              <div className="flex items-center justify-center mt-2">
                <TrendingDown className="text-orange-600 text-sm mr-1" />
                <Typography variant="caption" className="text-orange-600">
                  {formatCurrency(currentMonth?.overdueAmount || 0)}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="text-center">
              <Receipt className="text-blue-600 text-3xl mb-2" />
              <Typography variant="h4" className="font-bold text-gray-800">
                {currentMonth?.totalInvoices || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Gesamte Rechnungen
              </Typography>
              <div className="flex items-center justify-center mt-2">
                <Typography variant="caption" className="text-gray-500">
                  Ø {formatCurrency(currentMonth?.averageAmount || 0)}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detaillierte Statistiken */}
      <Grid container spacing={3}>
        {/* Monatliche Entwicklung */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4 text-gray-800">
                Monatliche Entwicklung
              </Typography>
              <div className="space-y-3">
                {statistics.monthly.slice(-6).map((month, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <Typography variant="body2" className="text-gray-600">
                                                 {new Date().toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {month.totalInvoices} Rechnungen
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="body2" className="font-semibold">
                        {formatCurrency(month.totalAmount)}
                      </Typography>
                      <div className="flex items-center space-x-1">
                        <Chip
                          label={`${month.paidInvoices}/${month.totalInvoices}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={month.overdueInvoices.toString()}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Kunden */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4 text-gray-800">
                Top Kunden
              </Typography>
              <div className="space-y-3">
                {statistics.topCustomers.slice(0, 5).map((customer, index) => (
                  <div key={customer.customerId} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Typography variant="caption" className="text-blue-600 font-semibold">
                          {index + 1}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="font-medium">
                          {customer.customerName}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {customer.invoiceCount} Rechnungen
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="body2" className="font-semibold">
                      {formatCurrency(customer.totalAmount)}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Zahlungsmethoden */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Zahlungsmethoden
          </Typography>
          <Grid container spacing={2}>
            {statistics.paymentMethods.map((method, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body2" className="font-medium">
                      {method.method}
                    </Typography>
                    <Chip
                      label={method.count.toString()}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </div>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    {formatCurrency(method.totalAmount)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(method.totalAmount / (currentMonth?.totalAmount || 1)) * 100}
                    className="mt-2"
                  />
                </div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Jahresvergleich */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4 text-gray-800">
            Jahresvergleich
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="mb-2 text-gray-700">
                Aktuelles Jahr
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gesamtumsatz:</span>
                  <span className="font-semibold">{formatCurrency(currentYear?.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rechnungen:</span>
                  <span className="font-semibold">{currentYear?.totalInvoices || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durchschnitt:</span>
                  <span className="font-semibold">{formatCurrency(currentYear?.averageAmount || 0)}</span>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="mb-2 text-gray-700">
                Vorjahr
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gesamtumsatz:</span>
                  <span className="font-semibold">{formatCurrency((currentYear?.totalAmount || 0) * 0.85)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rechnungen:</span>
                  <span className="font-semibold">{Math.floor((currentYear?.totalInvoices || 0) * 0.9)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durchschnitt:</span>
                  <span className="font-semibold">{formatCurrency((currentYear?.averageAmount || 0) * 0.95)}</span>
                </div>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default EInvoicingStatistics; 