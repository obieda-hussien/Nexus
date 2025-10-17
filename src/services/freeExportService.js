// free Export Service for Nexus LMS
// Uses native browser APIs for CSV and Excel export (100% free)

export class freeExportService {
  
  // Export data to CSV format (completely free)
  static exportToCSV(data, filename = 'export.csv', headers = null) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data available للExport');
      }

      // Auto-generate headers if not provided
      if (!headers && data.length > 0) {
        headers = Object.keys(data[0]);
      }

      // Create CSV content
      let csvContent = '';
      
      // Add headers
      if (headers) {
        csvContent += headers.map(header => this.escapeCSV(header)).join(',') + '\n';
      }
      
      // Add data rows
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          return this.escapeCSV(value);
        });
        csvContent += values.join(',') + '\n';
      });

      // Download the file
      this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      
      return { success: true, format: 'CSV', filename };
    } catch (error) {
      console.error('خطأ في Export CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Export data to Excel format using HTML table method (free)
  static exportToExcel(data, filename = 'export.xlsx', sheetName = 'Data') {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Create HTML table structure for Excel with enhanced compatibility
      const headers = Object.keys(data[0]);
      
      let htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Excel.Sheet">
          <meta name="Generator" content="Nexus LMS Export">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>${sheetName}</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { 
              border-collapse: collapse; 
              width: 100%; 
              font-family: Arial, sans-serif; 
              font-size: 11pt;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 6px 8px; 
              text-align: left; 
              vertical-align: top;
              white-space: nowrap;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
              text-align: center;
            }
            .number { 
              text-align: right; 
              mso-number-format: "#,##0.00";
            }
            .date { 
              mso-number-format: "mm/dd/yyyy";
            }
            .text {
              mso-number-format: "@";
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>`;
      
      // Add headers with proper styling
      headers.forEach(header => {
        htmlContent += `<th class="text">${this.escapeHTML(header)}</th>`;
      });
      
      htmlContent += `</tr></thead><tbody>`;
      
      // Add data rows with enhanced type detection
      data.forEach(row => {
        htmlContent += '<tr>';
        headers.forEach(header => {
          const value = row[header];
          let cellValue = '';
          let cellClass = 'text';
          
          if (value === null || value === undefined) {
            cellValue = '';
          } else if (typeof value === 'number') {
            cellValue = value.toString();
            cellClass = 'number';
          } else if (this.isDate(value)) {
            cellValue = new Date(value).toLocaleDateString('en-US');
            cellClass = 'date';
          } else if (!isNaN(value) && value !== '' && value !== null) {
            cellValue = parseFloat(value).toString();
            cellClass = 'number';
          } else {
            cellValue = this.escapeHTML(value.toString());
            cellClass = 'text';
          }
          
          htmlContent += `<td class="${cellClass}">${cellValue}</td>`;
        });
        htmlContent += '</tr>';
      });
      
      htmlContent += `</tbody></table></body></html>`;

      // Use proper Excel MIME type for better compatibility
      this.downloadFile(htmlContent, filename, 'application/vnd.ms-excel');
      
      return { success: true, format: 'Excel', filename };
    } catch (error) {
      console.error('Excel export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export tax report data in English
  static exportTaxReport(taxData, year, format = 'csv') {
    try {
      const filename = `tax-report-${year}.${format}`;
      
      // Prepare tax data for export in English
      const exportData = [];
      
      // Add summary information in English
      exportData.push({
        'Category': 'Total Earnings',
        'Amount (EGP)': taxData.totalEarnings || 0,
        'Percentage': '100%',
        'Notes': 'Total earnings from Nexus platform'
      });
      
      exportData.push({
        'Category': 'Platform Commission',
        'Amount (EGP)': taxData.platformFees || 0,
        'Percentage': '10%',
        'Notes': 'Platform commission deduction'
      });
      
      exportData.push({
        'Category': 'Tax Due',
        'Amount (EGP)': taxData.totalTax || 0,
        'Percentage': this.calculateTaxRate(taxData.totalEarnings) + '%',
        'Notes': 'According to Egyptian tax law'
      });
      
      exportData.push({
        'Category': 'Net Earnings',
        'Amount (EGP)': taxData.netEarnings || 0,
        'Percentage': ((taxData.netEarnings / taxData.totalEarnings) * 100).toFixed(1) + '%',
        'Notes': 'Earnings after commission and taxes'
      });

      // Add monthly breakdown if available
      if (taxData.monthlyBreakdown) {
        exportData.push({
          'Category': '--- monthly Details ---',
          'Amount (EGP)': '',
          'Percentage': '',
          'Notes': ''
        });
        
        taxData.monthlyBreakdown.forEach((month, index) => {
          exportData.push({
            'Category': `Month ${index + 1}`,
            'Amount (EGP)': month.earnings || 0,
            'Percentage': ((month.earnings / taxData.totalEarnings) * 100).toFixed(1) + '%',
            'Notes': this.getMonthNameEnglish(index + 1)
          });
        });
      }

      if (format === 'excel' || format === 'xlsx') {
        return this.exportToExcel(exportData, filename, `Tax Report ${year}`);
      } else {
        return this.exportToCSV(exportData, filename.replace('.xlsx', '.csv'));
      }
    } catch (error) {
      console.error('Tax report export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export withdrawal history in English
  static exportWithdrawalHistory(withdrawals, format = 'csv') {
    try {
      const filename = `withdrawal-history-${new Date().getFullYear()}.${format}`;
      
      const exportData = withdrawals.map(withdrawal => ({
        'Transaction ID': withdrawal.id,
        'Date': new Date(withdrawal.requestedAt).toLocaleDateString('en-US'),
        'Requested Amount': withdrawal.amount,
        'Net Amount': withdrawal.netAmount,
        'Currency': withdrawal.currency,
        'Payment Method': this.getPaymentMethodNameEn(withdrawal.paymentMethod?.type),
        'Status': this.getStatusNameEn(withdrawal.status),
        'Transaction Reference': withdrawal.transactionId || 'Not available',
        'Completion Date': withdrawal.completedAt ? new Date(withdrawal.completedAt).toLocaleDateString('en-US') : 'Not completed',
        'Processing Fees': withdrawal.fees?.total || 0,
        'Platform Commission': withdrawal.platformFee || 0,
        'Tax Amount': withdrawal.taxAmount || 0
      }));

      if (format === 'excel' || format === 'xlsx') {
        return this.exportToExcel(exportData, filename, 'Withdrawal History');
      } else {
        return this.exportToCSV(exportData, filename.replace('.xlsx', '.csv'));
      }
    } catch (error) {
      console.error('Withdrawal history export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  static escapeCSV(value) {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // If value contains comma, newline, or quotes, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
  }

  static escapeHTML(value) {
    if (value === null || value === undefined) return '';
    
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static isDate(value) {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  static downloadFile(content, filename, contentType) {
    try {
      // Validate input parameters
      if (!content) {
        throw new Error('Content is required for file download');
      }
      
      if (!filename) {
        throw new Error('Filename is required for file download');
      }
      
      // Ensure content is properly encoded for the content type
      let blobContent = content;
      let blobOptions = { type: contentType };
      
      // Handle different content types properly
      if (contentType.includes('text/csv')) {
        // For CSV, add UTF-8 BOM for proper encoding
        blobContent = '\ufeff' + content;
        blobOptions = { type: 'text/csv;charset=utf-8' };
      } else if (contentType.includes('application/vnd.ms-excel')) {
        // For Excel, ensure proper HTML encoding
        blobOptions = { type: 'application/vnd.ms-excel;charset=utf-8' };
      }
      
      // Create blob with enhanced error handling
      let blob;
      try {
        blob = new Blob([blobContent], blobOptions);
      } catch (blobError) {
        console.error('Blob creation failed:', blobError);
        throw new Error(`Failed to create file blob: ${blobError.message}`);
      }
      
      // Validate blob creation
      if (!blob || blob.size === 0) {
        throw new Error('Created blob is empty or invalid');
      }
      
      // Create object URL with error handling
      let url;
      try {
        url = window.URL.createObjectURL(blob);
      } catch (urlError) {
        console.error('createObjectURL failed:', urlError);
        throw new Error(`Failed to create object URL: ${urlError.message}`);
      }
      
      // Validate URL creation
      if (!url) {
        throw new Error('Failed to create download URL');
      }
      
      // Create and configure download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none'; // Ensure link is hidden
      
      // Add to DOM temporarily for download
      document.body.appendChild(link);
      
      try {
        // Trigger download
        link.click();
      } catch (clickError) {
        console.error('Download click failed:', clickError);
        throw new Error(`Failed to trigger download: ${clickError.message}`);
      } finally {
        // Clean up DOM
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }
      
      // Clean up object URL with proper error handling
      try {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000); // Increased timeout for better stability
      } catch (revokeError) {
        console.warn('Failed to revoke object URL:', revokeError);
        // Not critical, continue execution
      }
      
    } catch (error) {
      console.error('File download error:', error);
      throw new Error(`فشل في تحميل الملف: ${error.message}`);
    }
  }

  static calculateTaxRate(annualIncome) {
    // Egyptian tax brackets 2024
    if (annualIncome <= 8000) return 0;
    if (annualIncome <= 30000) return 2.5;
    if (annualIncome <= 45000) return 10;
    if (annualIncome <= 60000) return 15;
    if (annualIncome <= 200000) return 20;
    if (annualIncome <= 400000) return 22.5;
    return 25;
  }

  static getMonthName(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || `الشهر ${monthNumber}`;
  }

  static getMonthNameEnglish(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || `Month ${monthNumber}`;
  }

  static getPaymentMethodNameAr(type) {
    const names = {
      stripe: 'بطاقة ائتمانية',
      paypal: 'PayPal',
      fawry: 'instant',
      vodafone: 'Vodafone Cash',
      bank: 'Bank Transfer'
    };
    return names[type] || type;
  }

  static getPaymentMethodNameEn(type) {
    const names = {
      stripe: 'Credit Card',
      paypal: 'PayPal',
      fawry: 'Fawry',
      vodafone: 'Vodafone Cash',
      bank: 'Bank Transfer'
    };
    return names[type] || type;
  }

  static getStatusNameAr(status) {
    const names = {
      pending: 'Suspended',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'فاشل',
      cancelled: 'ملغي'
    };
    return names[status] || status;
  }

  static getStatusNameEn(status) {
    const names = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled'
    };
    return names[status] || status;
  }

  // Check if export service is available (always true since it's native)
  static checkAvailability() {
    return {
      available: true,
      formats: ['CSV', 'Excel'],
      cost: 'free 100%',
      features: [
        'Export CSV محلي',
        'Export Excel متوافق', 
        'دعم اللغة Arabic',
        'لا توجد قيود على الحجم',
        'عمل دون اتصال بالإنترنت'
      ]
    };
  }
}

export default freeExportService;