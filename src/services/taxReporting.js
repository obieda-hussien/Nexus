import jsPDF from 'jspdf';
import freeExportService from './freeExportService';
import { ref, get, query, orderByChild, startAt, endAt } from 'firebase/database';
import { db } from '../config/firebase';

// Tax Reporting Configuration
const TAX_CONFIG = {
  egypt: {
    // Egyptian tax rates and thresholds
    personalIncomeTax: {
      brackets: [
        { min: 0, max: 8000, rate: 0 },
        { min: 8000, max: 30000, rate: 0.025 },
        { min: 30000, max: 45000, rate: 0.10 },
        { min: 45000, max: 60000, rate: 0.15 },
        { min: 60000, max: 200000, rate: 0.20 },
        { min: 200000, max: 400000, rate: 0.225 },
        { min: 400000, max: Infinity, rate: 0.25 }
      ]
    },
    businessTax: {
      rate: 0.225, // 22.5% for businesses
      threshold: 50000 // Minimum income threshold
    },
    deductions: {
      standardDeduction: 9000, // Standard deduction amount
      businessExpenses: 0.20, // Up to 20% of income for business expenses
      educationExpenses: 0.05 // Up to 5% for education-related expenses
    },
    currency: 'EGP',
    taxYear: new Date().getFullYear(),
    quarters: [
      { name: 'Q1', months: [1, 2, 3], deadline: '2024-04-30' },
      { name: 'Q2', months: [4, 5, 6], deadline: '2024-07-31' },
      { name: 'Q3', months: [7, 8, 9], deadline: '2024-10-31' },
      { name: 'Q4', months: [10, 11, 12], deadline: '2025-01-31' }
    ]
  }
};

export class TaxReportingService {
  
  // Generate comprehensive annual tax report
  static async generateAnnualTaxReport(instructorId, year = new Date().getFullYear()) {
    try {
      // Collect all financial data for the year
      const financialData = await this.collectAnnualFinancialData(instructorId, year);
      
      // Calculate tax obligations
      const taxCalculations = this.calculateTaxObligations(financialData);
      
      // Generate quarterly breakdown
      const quarterlyReports = await this.generateQuarterlyReports(instructorId, year);
      
      // Prepare comprehensive report
      const reportData = {
        instructorId,
        year,
        reportType: 'annual',
        generatedDate: new Date().toISOString(),
        currency: TAX_CONFIG.egypt.currency,
        
        // Income Summary
        income: {
          totalGrossIncome: financialData.totalIncome,
          coursesSales: financialData.coursesSales,
          otherIncome: financialData.otherIncome,
          monthlyBreakdown: financialData.monthlyIncome
        },
        
        // Deductions and Expenses
        deductions: {
          platformCommission: financialData.platformCommission,
          paymentFees: financialData.paymentFees,
          businessExpenses: financialData.businessExpenses,
          standardDeduction: TAX_CONFIG.egypt.deductions.standardDeduction,
          totalDeductions: taxCalculations.totalDeductions
        },
        
        // Tax Calculations
        tax: {
          taxableIncome: taxCalculations.taxableIncome,
          taxBracket: taxCalculations.applicableBracket,
          estimatedTax: taxCalculations.estimatedTax,
          quarterlyPayments: taxCalculations.quarterlyPayments,
          remainingTaxDue: taxCalculations.remainingTaxDue
        },
        
        // Quarterly Reports
        quarterly: quarterlyReports,
        
        // Withdrawal Summary
        withdrawals: {
          totalWithdrawn: financialData.totalWithdrawn,
          withdrawalMethods: financialData.withdrawalMethods,
          withdrawalFees: financialData.withdrawalFees,
          pendingWithdrawals: financialData.pendingWithdrawals
        },
        
        // Supporting Documents
        documents: {
          invoices: financialData.invoices,
          receipts: financialData.receipts,
          bankStatements: financialData.bankStatements
        },
        
        // Compliance Information
        compliance: {
          taxFormRequired: this.determineTaxFormRequired(taxCalculations.taxableIncome),
          deadlines: this.getTaxDeadlines(year),
          recommendations: this.getTaxRecommendations(financialData, taxCalculations)
        }
      };
      
      return reportData;
      
    } catch (error) {
      console.error('Error generating annual tax report:', error);
      
      // Provide specific guidance for Firebase indexing errors
      if (error.message && error.message.includes('Database needs indexing')) {
        throw new Error(`${error.message}\n\nخطوات الحل:\n1. اذهب إلى Firebase Console\n2. اOpen Realtime Database → Rules\n3. اCopy Content من ملف firebase-rules-withdrawal.json\n4. انتظر 2-3 minutes لبناء الفهارس\n5. أعد المحاولة`);
      }
      
      throw new Error(`Annual tax report generation failed: ${error.message}`);
    }
  }
  
  // Collect all financial data for a specific year
  static async collectAnnualFinancialData(instructorId, year) {
    try {
      const startDate = new Date(year, 0, 1).getTime();
      const endDate = new Date(year, 11, 31, 23, 59, 59).getTime();
      
      // Get instructor earnings
      const earningsRef = ref(db, `users/${instructorId}/earnings`);
      const earningsSnapshot = await get(earningsRef);
      const earnings = earningsSnapshot.val() || {};
      
      // Get withdrawal history with proper error handling for missing indexes
      try {
        const withdrawalsQuery = query(
          ref(db, `users/${instructorId}/withdrawalHistory`),
          orderByChild('requestedAt'),
          startAt(startDate),
          endAt(endDate)
        );
        const withdrawalsSnapshot = await get(withdrawalsQuery);
        const withdrawals = withdrawalsSnapshot.val() || {};
        
        // Get course sales data
        const salesData = await this.getCourseSalesData(instructorId, year);
        
        // Calculate totals
        const totalIncome = Object.values(salesData.monthlySales).reduce((sum, month) => sum + month.revenue, 0);
        const platformCommission = totalIncome * 0.10; // 10% platform commission
        const totalWithdrawn = Object.values(withdrawals).reduce((sum, w) => sum + (w.amount || 0), 0);
        const withdrawalFees = Object.values(withdrawals).reduce((sum, w) => sum + (w.fees?.fee || 0), 0);
        
        return {
          totalIncome,
          coursesSales: salesData.totalSales,
          otherIncome: 0, // Can be expanded for other income sources
          monthlyIncome: salesData.monthlySales,
          platformCommission,
          paymentFees: withdrawalFees,
          businessExpenses: this.calculateBusinessExpenses(totalIncome),
          totalWithdrawn,
          withdrawalMethods: this.summarizeWithdrawalMethods(withdrawals),
          withdrawalFees,
          pendingWithdrawals: Object.values(withdrawals).filter(w => w.status === 'pending').length,
          invoices: [], // To be implemented based on requirements
          receipts: [], // To be implemented
          bankStatements: [] // To be implemented
        };
        
      } catch (error) {
        if (error.message && error.message.includes('Index not defined')) {
          throw new Error(`Database needs indexing. Please Update قواعد Firebase وAdd الفهرس للحقل "requestedAt" في مسار withdrawalHistory. Review ملف FIREBASE_SETUP.md للDetails.`);
        }
        throw error;
      }
      
    } catch (error) {
      console.error('Error collecting financial data:', error);
      throw error;
    }
  }
  
  // Get course sales data for tax reporting
  static async getCourseSalesData(instructorId, year) {
    try {
      // This would typically come from your sales/enrollment system
      // For now, we'll use a simplified approach
      const coursesRef = ref(db, `courses`);
      const coursesSnapshot = await get(coursesRef);
      const allCourses = coursesSnapshot.val() || {};
      
      // Filter instructor's courses
      const instructorCourses = Object.entries(allCourses)
        .filter(([_, course]) => course.instructorId === instructorId);
      
      // Calculate monthly sales (simplified - would need actual enrollment/payment data)
      const monthlySales = {};
      let totalSales = 0;
      
      for (let month = 1; month <= 12; month++) {
        const monthRevenue = Math.random() * 5000; // Placeholder - replace with actual data
        monthlySales[month] = {
          month,
          revenue: monthRevenue,
          enrollments: Math.floor(monthRevenue / 100), // Assuming avg price of 100 EGP
          courses: instructorCourses.length
        };
        totalSales += monthRevenue;
      }
      
      return {
        totalSales,
        monthlySales,
        coursesCount: instructorCourses.length
      };
      
    } catch (error) {
      console.error('Error getting course sales data:', error);
      return { totalSales: 0, monthlySales: {}, coursesCount: 0 };
    }
  }
  
  // Calculate tax obligations based on Egyptian tax law
  static calculateTaxObligations(financialData) {
    const grossIncome = financialData.totalIncome;
    const businessExpenses = financialData.businessExpenses;
    const standardDeduction = TAX_CONFIG.egypt.deductions.standardDeduction;
    const platformCommission = financialData.platformCommission;
    
    // Calculate total deductions
    const totalDeductions = businessExpenses + standardDeduction + platformCommission;
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    
    // Find applicable tax bracket
    const applicableBracket = TAX_CONFIG.egypt.personalIncomeTax.brackets.find(
      bracket => taxableIncome >= bracket.min && taxableIncome < bracket.max
    );
    
    // Calculate estimated tax
    let estimatedTax = 0;
    let remainingIncome = taxableIncome;
    
    for (const bracket of TAX_CONFIG.egypt.personalIncomeTax.brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      estimatedTax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
      
      if (remainingIncome <= 0) break;
    }
    
    // Calculate quarterly payments (if applicable)
    const quarterlyPayments = estimatedTax / 4;
    
    return {
      taxableIncome,
      applicableBracket,
      estimatedTax: Math.round(estimatedTax),
      quarterlyPayments: Math.round(quarterlyPayments),
      remainingTaxDue: Math.round(estimatedTax), // Assuming no payments made yet
      totalDeductions
    };
  }
  
  // Generate quarterly tax reports
  static async generateQuarterlyReports(instructorId, year) {
    const quarterlyReports = [];
    
    for (const quarter of TAX_CONFIG.egypt.quarters) {
      const startMonth = quarter.months[0];
      const endMonth = quarter.months[2];
      
      // Get quarterly financial data
      const quarterlyData = await this.getQuarterlyFinancialData(instructorId, year, startMonth, endMonth);
      
      quarterlyReports.push({
        quarter: quarter.name,
        months: quarter.months,
        deadline: quarter.deadline,
        income: quarterlyData.income,
        expenses: quarterlyData.expenses,
        taxableIncome: quarterlyData.taxableIncome,
        estimatedTax: quarterlyData.estimatedTax,
        paymentDue: quarterlyData.paymentDue
      });
    }
    
    return quarterlyReports;
  }
  
  // Get quarterly financial data
  static async getQuarterlyFinancialData(instructorId, year, startMonth, endMonth) {
    // Simplified implementation - would need actual quarterly data
    const annualData = await this.collectAnnualFinancialData(instructorId, year);
    const quarterlyRatio = 0.25; // Assuming equal distribution
    
    return {
      income: Math.round(annualData.totalIncome * quarterlyRatio),
      expenses: Math.round(annualData.businessExpenses * quarterlyRatio),
      taxableIncome: Math.round((annualData.totalIncome - annualData.businessExpenses) * quarterlyRatio),
      estimatedTax: Math.round(this.calculateTaxObligations(annualData).estimatedTax * quarterlyRatio),
      paymentDue: Math.round(this.calculateTaxObligations(annualData).estimatedTax * quarterlyRatio)
    };
  }
  
  // Calculate business expenses
  static calculateBusinessExpenses(totalIncome) {
    // Allow up to 20% of income as business expenses (as per Egyptian tax law)
    const maxBusinessExpenses = totalIncome * TAX_CONFIG.egypt.deductions.businessExpenses;
    
    // For now, we'll estimate 10% as typical business expenses
    // In practice, this would be based on actual recorded expenses
    const estimatedExpenses = totalIncome * 0.10;
    
    return Math.min(estimatedExpenses, maxBusinessExpenses);
  }
  
  // Summarize withdrawal methods for tax reporting
  static summarizeWithdrawalMethods(withdrawals) {
    const summary = {};
    
    Object.values(withdrawals).forEach(withdrawal => {
      const method = withdrawal.paymentMethod?.type || 'unknown';
      if (!summary[method]) {
        summary[method] = { count: 0, amount: 0, fees: 0 };
      }
      summary[method].count++;
      summary[method].amount += withdrawal.amount || 0;
      summary[method].fees += withdrawal.fees?.fee || 0;
    });
    
    return summary;
  }
  
  // Determine which tax form is required
  static determineTaxFormRequired(taxableIncome) {
    if (taxableIncome === 0) {
      return { form: 'No tax return required', reason: 'No taxable income' };
    } else if (taxableIncome < TAX_CONFIG.egypt.businessTax.threshold) {
      return { form: 'Form 1 (Individuals)', reason: 'Personal income below business activity minimum' };
    } else {
      return { form: 'Form 2 (Business Activity)', reason: 'Income from business activity' };
    }
  }
  
  // Get important tax deadlines
  static getTaxDeadlines(year) {
    return {
      quarterlyPayments: TAX_CONFIG.egypt.quarters.map(q => ({
        quarter: q.name,
        deadline: q.deadline
      })),
      annualReturn: `${year + 1}-05-31`, // May 31st following tax year
      finalPayment: `${year + 1}-07-31`, // July 31st following tax year
      amendments: `${year + 3}-12-31` // 3 years to amend
    };
  }
  
  // Get tax recommendations
  static getTaxRecommendations(financialData, taxCalculations) {
    const recommendations = [];
    
    if (taxCalculations.estimatedTax > 0) {
      recommendations.push('It is recommended to pay taxes in quarterly installments to avoid penalties');
    }
    
    if (financialData.businessExpenses < financialData.totalIncome * 0.15) {
      recommendations.push('Document work-related expenses to reduce tax liability');
    }
    
    if (financialData.totalIncome > TAX_CONFIG.egypt.businessTax.threshold) {
      recommendations.push('Consider registering a business to benefit from tax advantages');
    }
    
    recommendations.push('Keep all receipts and financial documents for 5 years');
    recommendations.push('Consult a qualified tax accountant to review your tax return');
    
    return recommendations;
  }
  
  // Generate PDF tax report with proper Arabic support
  static async generatePDFReport(reportData) {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font for Arabic content - use helvetica which supports Unicode
      pdf.setFont('helvetica');
      
      // Header in Arabic
      pdf.setFontSize(20);
      pdf.text('Annual Tax Report', 105, 20, { align: 'center' });
      pdf.text(`Nexus Educational Platform - ${reportData.year}`, 105, 30, { align: 'center' });
      
      // Income Summary
      let yPos = 50;
      pdf.setFontSize(14);
      pdf.text('Income Summary:', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Total Gross Income: ${reportData.income.totalGrossIncome.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      pdf.text(`Course Sales: ${reportData.income.coursesSales.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      
      // Deductions
      yPos += 10;
      pdf.setFontSize(14);
      pdf.text('Deductions:', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Platform Commission: ${reportData.deductions.platformCommission.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      pdf.text(`Payment Fees: ${reportData.deductions.paymentFees?.toLocaleString() || 0} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      pdf.text(`Standard Deduction: ${reportData.deductions.standardDeduction.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      pdf.text(`Total Deductions: ${reportData.deductions.totalDeductions.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      
      // Tax Calculations
      yPos += 10;
      pdf.setFontSize(14);
      pdf.text('Tax Calculations:', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Taxable Income: ${reportData.tax.taxableIncome.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      pdf.text(`Estimated Tax: ${reportData.tax.estimatedTax.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      pdf.text(`Quarterly Payment: ${reportData.tax.quarterlyPayments.toLocaleString()} ${reportData.currency}`, 20, yPos);
      yPos += 7;
      
      // Quarterly Breakdown
      if (reportData.quarterly && reportData.quarterly.length > 0) {
        yPos += 15;
        pdf.setFontSize(14);
        pdf.text('Quarterly Details:', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        reportData.quarterly.forEach(quarter => {
          pdf.text(`${quarter.quarter}: الدخل ${quarter.income.toLocaleString()} - الضريبة ${quarter.estimatedTax.toLocaleString()} ${reportData.currency}`, 20, yPos);
          yPos += 6;
        });
      }
      
      // Compliance Information
      yPos += 15;
      pdf.setFontSize(14);
      pdf.text('Compliance Information:', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Required Form: ${reportData.compliance.taxFormRequired.form}`, 20, yPos);
      yPos += 7;
      pdf.text(`Annual Return Deadline: ${reportData.compliance.deadlines.annualReturn}`, 20, yPos);
      yPos += 7;
      
      // Recommendations in Arabic
      if (reportData.compliance.recommendations && reportData.compliance.recommendations.length > 0) {
        yPos += 10;
        pdf.setFontSize(14);
        pdf.text('Recommendations:', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        const arabicRecommendations = [
          '1. It is recommended to pay taxes in quarterly installments to avoid penalties',
          '2. Document work-related expenses to reduce tax liability',
          '3. Consider registering a business to benefit from tax advantages',
          '4. Keep all receipts and financial documents for 5 years',
          '5. Consult a qualified tax accountant to review your tax return'
        ];
        
        arabicRecommendations.forEach((recommendation) => {
          const lines = pdf.splitTextToSize(recommendation, 170);
          pdf.text(lines, 20, yPos);
          yPos += lines.length * 5;
        });
      }
      
      // Footer in Arabic
      pdf.setFontSize(8);
      pdf.text(`Report generated on: ${new Date().toLocaleDateString('ar-EG')}`, 20, 280);
      pdf.text('This report is for informational purposes only - consult a qualified tax accountant', 20, 285);
      
      return pdf.output('blob');
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }
  
  // Generate Excel tax report using free export service (English)
  static generateExcelReport(reportData) {
    try {
      // Convert report data to a flat structure for CSV/Excel export in English
      const exportData = [];
      
      // Summary information
      exportData.push({
        'Statement Category': 'Income Summary',
        'Statement Type': 'Total Gross Income',
        'Amount': reportData.income.totalGrossIncome,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Total income from all sources'
      });
      
      exportData.push({
        'Statement Category': 'Income Summary',
        'Statement Type': 'Course Sales',
        'Amount': reportData.income.coursesSales,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Income from course sales'
      });
      
      // Deductions
      exportData.push({
        'Statement Category': 'Deductions',
        'Statement Type': 'Platform Commission',
        'Amount': reportData.deductions.platformCommission,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Platform commission (10%)'
      });
      
      exportData.push({
        'Statement Category': 'Deductions',
        'Statement Type': 'Standard Deduction',
        'Amount': reportData.deductions.standardDeduction,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Legal standard deduction allowed'
      });
      
      exportData.push({
        'Statement Category': 'Deductions',
        'Statement Type': 'Total Deductions',
        'Amount': reportData.deductions.totalDeductions,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Sum of all deductions'
      });
      
      // Tax calculations
      exportData.push({
        'Statement Category': 'Tax Calculations',
        'Statement Type': 'Taxable Income',
        'Amount': reportData.tax.taxableIncome,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Income after deductions'
      });
      
      exportData.push({
        'Statement Category': 'Tax Calculations',
        'Statement Type': 'Estimated Tax',
        'Amount': reportData.tax.estimatedTax,
        'Currency': reportData.currency,
        'Year': reportData.year,
        'Notes': 'Tax calculated according to Egyptian law'
      });
      
      // Add monthly breakdown if available
      if (reportData.income.monthlyBreakdown) {
        Object.entries(reportData.income.monthlyBreakdown).forEach(([month, data]) => {
          exportData.push({
            'Statement Category': 'monthly Breakdown',
            'Statement Type': `Month ${month}`,
            'Amount': data.revenue,
            'Currency': reportData.currency,
            'Year': reportData.year,
            'Notes': `Number of sales: ${data.enrollments}`
          });
        });
      }
      
      // Add quarterly data if available
      if (reportData.quarterly) {
        reportData.quarterly.forEach(quarter => {
          exportData.push({
            'Statement Category': 'Quarterly Reports',
            'Statement Type': quarter.quarter,
            'Amount': quarter.taxableIncome,
            'Currency': reportData.currency,
            'Year': reportData.year,
            'Notes': `Estimated tax: ${quarter.estimatedTax} - Deadline: ${quarter.deadline}`
          });
        });
      }
      
      // Use our free export service to generate the Excel file
      const filename = `tax-report-${reportData.year}.xlsx`;
      const result = freeExportService.exportToExcel(exportData, filename, `Tax Report ${reportData.year}`);
      
      if (result.success) {
        return { success: true, filename: result.filename };
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Error generating Excel report:', error);
      throw new Error(`Failed to generate Excel report: ${error.message}`);
    }
  }
  
  // Generate monthly tax summary for regular reporting
  static async generatemonthlySummary(instructorId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1).getTime();
      const endDate = new Date(year, month, 0, 23, 59, 59).getTime();
      
      // Get monthly data (simplified)
      const monthlyIncome = await this.getmonthlyIncome(instructorId, year, month);
      const monthlyExpenses = monthlyIncome * 0.10; // Estimated expenses
      const monthlyTax = this.calculatemonthlyTax(monthlyIncome - monthlyExpenses);
      
      return {
        month,
        year,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        netIncome: monthlyIncome - monthlyExpenses,
        estimatedTax: monthlyTax,
        currency: TAX_CONFIG.egypt.currency
      };
      
    } catch (error) {
      console.error('Error generating monthly summary:', error);
      throw error;
    }
  }
  
  // Calculate monthly tax (simplified)
  static calculatemonthlyTax(monthlyNetIncome) {
    const annualizedIncome = monthlyNetIncome * 12;
    const annualTax = this.calculateTaxObligations({ totalIncome: annualizedIncome, businessExpenses: 0, platformCommission: 0 }).estimatedTax;
    return Math.round(annualTax / 12);
  }
  
  // Get monthly income (simplified)
  static async getmonthlyIncome(instructorId, year, month) {
    // This would connect to actual sales/enrollment data
    // For now, returning a placeholder
    return Math.random() * 5000;
  }
  
  // Export tax data in various formats
  static async exportTaxData(instructorId, year, format = 'pdf') {
    try {
      const reportData = await this.generateAnnualTaxReport(instructorId, year);
      
      switch (format.toLowerCase()) {
        case 'pdf':
          return await this.generatePDFReport(reportData);
        case 'excel':
        case 'xlsx':
          return this.generateExcelReport(reportData);
        case 'json':
          return new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
    } catch (error) {
      console.error('Error exporting tax data:', error);
      throw error;
    }
  }
  
  // Schedule automated monthly reports
  static schedulemonthlyReports(instructorId, emailService) {
    // This would be implemented with a scheduling system
    // For now, we'll return the configuration
    return {
      enabled: true,
      frequency: 'monthly',
      dayOfMonth: 5, // Send on 5th of each month
      recipients: [instructorId],
      formats: ['pdf', 'excel'],
      autoEmail: true,
      nextReport: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5)
    };
  }
}

export default TaxReportingService;