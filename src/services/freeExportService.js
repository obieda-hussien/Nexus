// Free Export Service for Nexus LMS
// Uses native browser APIs for CSV and Excel export (100% free)

export class FreeExportService {
  
  // Export data to CSV format (completely free)
  static exportToCSV(data, filename = 'export.csv', headers = null) {
    try {
      if (!data || data.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
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
      console.error('خطأ في تصدير CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Export data to Excel format using HTML table method (free)
  static exportToExcel(data, filename = 'export.xlsx', sheetName = 'البيانات') {
    try {
      if (!data || data.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create HTML table structure for Excel
      const headers = Object.keys(data[0]);
      
      let htmlContent = `
        <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .number { text-align: center; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>`;
      
      // Add headers
      headers.forEach(header => {
        htmlContent += `<th>${this.escapeHTML(header)}</th>`;
      });
      
      htmlContent += `</tr></thead><tbody>`;
      
      // Add data rows
      data.forEach(row => {
        htmlContent += '<tr>';
        headers.forEach(header => {
          const value = row[header] || '';
          const isNumber = !isNaN(value) && value !== '';
          htmlContent += `<td class="${isNumber ? 'number' : ''}">${this.escapeHTML(value)}</td>`;
        });
        htmlContent += '</tr>';
      });
      
      htmlContent += `</tbody></table></body></html>`;

      // Download as Excel file
      this.downloadFile(htmlContent, filename, 'application/vnd.ms-excel;charset=utf-8;');
      
      return { success: true, format: 'Excel', filename };
    } catch (error) {
      console.error('خطأ في تصدير Excel:', error);
      return { success: false, error: error.message };
    }
  }

  // Export tax report data
  static exportTaxReport(taxData, year, format = 'csv') {
    try {
      const filename = `tax-report-${year}.${format}`;
      
      // Prepare tax data for export
      const exportData = [];
      
      // Add summary information
      exportData.push({
        'نوع البيان': 'إجمالي الأرباح',
        'المبلغ (جنيه)': taxData.totalEarnings || 0,
        'النسبة': '100%',
        'ملاحظات': 'إجمالي الأرباح من منصة نيكسوس'
      });
      
      exportData.push({
        'نوع البيان': 'عمولة المنصة',
        'المبلغ (جنيه)': taxData.platformFees || 0,
        'النسبة': '10%',
        'ملاحظات': 'خصم عمولة المنصة'
      });
      
      exportData.push({
        'نوع البيان': 'الضرائب المستحقة',
        'المبلغ (جنيه)': taxData.totalTax || 0,
        'النسبة': this.calculateTaxRate(taxData.totalEarnings) + '%',
        'ملاحظات': 'وفقاً لقانون الضرائب المصري'
      });
      
      exportData.push({
        'نوع البيان': 'صافي الأرباح',
        'المبلغ (جنيه)': taxData.netEarnings || 0,
        'النسبة': ((taxData.netEarnings / taxData.totalEarnings) * 100).toFixed(1) + '%',
        'ملاحظات': 'الأرباح بعد خصم العمولة والضرائب'
      });

      // Add monthly breakdown if available
      if (taxData.monthlyBreakdown) {
        exportData.push({
          'نوع البيان': '--- التفاصيل الشهرية ---',
          'المبلغ (جنيه)': '',
          'النسبة': '',
          'ملاحظات': ''
        });
        
        taxData.monthlyBreakdown.forEach((month, index) => {
          exportData.push({
            'نوع البيان': `الشهر ${index + 1}`,
            'المبلغ (جنيه)': month.earnings || 0,
            'النسبة': ((month.earnings / taxData.totalEarnings) * 100).toFixed(1) + '%',
            'ملاحظات': this.getMonthName(index + 1)
          });
        });
      }

      if (format === 'excel' || format === 'xlsx') {
        return this.exportToExcel(exportData, filename, `التقرير الضريبي ${year}`);
      } else {
        return this.exportToCSV(exportData, filename.replace('.xlsx', '.csv'));
      }
    } catch (error) {
      console.error('خطأ في تصدير التقرير الضريبي:', error);
      return { success: false, error: error.message };
    }
  }

  // Export withdrawal history
  static exportWithdrawalHistory(withdrawals, format = 'csv') {
    try {
      const filename = `withdrawal-history-${new Date().getFullYear()}.${format}`;
      
      const exportData = withdrawals.map(withdrawal => ({
        'رقم العملية': withdrawal.id,
        'التاريخ': new Date(withdrawal.requestedAt).toLocaleDateString('ar-EG'),
        'المبلغ المطلوب': withdrawal.amount,
        'المبلغ الصافي': withdrawal.netAmount,
        'العملة': withdrawal.currency,
        'طريقة الدفع': this.getPaymentMethodNameAr(withdrawal.paymentMethod?.type),
        'الحالة': this.getStatusNameAr(withdrawal.status),
        'رقم المعاملة': withdrawal.transactionId || 'غير متاح',
        'وقت الإتمام': withdrawal.completedAt ? new Date(withdrawal.completedAt).toLocaleDateString('ar-EG') : 'لم يتم',
        'رسوم المعالجة': withdrawal.fees?.total || 0,
        'عمولة المنصة': withdrawal.platformFee || 0,
        'الضرائب': withdrawal.taxAmount || 0
      }));

      if (format === 'excel' || format === 'xlsx') {
        return this.exportToExcel(exportData, filename, 'سجل السحوبات');
      } else {
        return this.exportToCSV(exportData, filename.replace('.xlsx', '.csv'));
      }
    } catch (error) {
      console.error('خطأ في تصدير سجل السحوبات:', error);
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

  static downloadFile(content, filename, contentType) {
    // Create blob
    const blob = new Blob(['\ufeff' + content], { type: contentType }); // \ufeff for UTF-8 BOM
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(url);
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
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthNumber - 1] || `الشهر ${monthNumber}`;
  }

  static getPaymentMethodNameAr(type) {
    const names = {
      stripe: 'بطاقة ائتمانية',
      paypal: 'PayPal',
      fawry: 'فوري',
      vodafone: 'فودافون كاش',
      bank: 'تحويل بنكي'
    };
    return names[type] || type;
  }

  static getStatusNameAr(status) {
    const names = {
      pending: 'معلق',
      processing: 'قيد المعالجة',
      completed: 'مكتمل',
      failed: 'فاشل',
      cancelled: 'ملغي'
    };
    return names[status] || status;
  }

  // Check if export service is available (always true since it's native)
  static checkAvailability() {
    return {
      available: true,
      formats: ['CSV', 'Excel'],
      cost: 'مجاني 100%',
      features: [
        'تصدير CSV محلي',
        'تصدير Excel متوافق', 
        'دعم اللغة العربية',
        'لا توجد قيود على الحجم',
        'عمل دون اتصال بالإنترنت'
      ]
    };
  }
}

export default FreeExportService;