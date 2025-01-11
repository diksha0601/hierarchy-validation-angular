import { Injectable } from '@angular/core';
import { ROLES, RULES, ERROR_MESSAGES } from './role-validation.constant';

@Injectable({
  providedIn: 'root',
})
export class RuleValidationService {
  constructor() {}

  // Validates a single row based on rules
  private passRule(excelRow: any, rule: any, rowNumber: number): string[] {
    const errors: string[] = [];

    if (excelRow.role !== rule.role) {
      return errors; // Skip rule if not applicable for this row
    }

    // Validate if the current role can have multiple users
    if (!rule.canMultiple && excelRow.count > 1) {
      errors.push(ERROR_MESSAGES.MULTIPLE_INSTANCE_ERROR(rowNumber, excelRow.role,));
    }

    if (excelRow.reportToEmailList.length > 1) {
      errors.push(ERROR_MESSAGES.MULTIPLE_REPORTING(rowNumber, excelRow.role, excelRow.email, excelRow.name, excelRow.reportToEmailList.join(', ')));
    }

    for(let i = 0; i < excelRow.reportsToRoleList.length; i++) {
      const reportToRole = excelRow.reportsToRoleList[i];
      const reportToEmail = excelRow.reportToEmailList[i];
      if (reportToRole !== '' && !rule.canReportTo.includes(reportToRole)) {
        errors.push(ERROR_MESSAGES.INVALID_REPORT_TO(rowNumber, excelRow.role, reportToRole, excelRow.email, excelRow.name, reportToEmail));
      }
    }

    return errors;
  }

  // Main logic to validate all rows
  runLogic(excelRows: any[]): string[] {
    const returnedErrors: string[] = [];

    excelRows.forEach((row, index) => {
      const errors: string[] = [];
      const rowNumber = index + 1;
      const rule = RULES.find((r) => r.role === row.role);

      if (!rule) {
        errors.push(ERROR_MESSAGES.UNDEFINED_RULE(rowNumber, row.role));
        return;
      }

      const validationErrors = this.passRule(row, rule, rowNumber);

      if (validationErrors.length > 0) {
        returnedErrors.push(validationErrors.join(','));
      } else {
        returnedErrors.push('No Error')
      }
    });

    return returnedErrors;
  }

  // Transforms Excel data into a standardized format
  transformExcelData(excelData: any[]): any[] {
    return excelData.map((row, index) => {
      const reportToEmailList = row.ReportsTo.split(';').filter((email: string) => email.trim() !== '');
      const reportsToRoleList: string[] = reportToEmailList.map((email: string) => {
        const parent = excelData.find((parentRow) => parentRow.Email === email.trim());
        return parent ? parent.Role : null;
      });

      return {
        id: index + 1,
        email: row.Email,
        name: row.FullName,
        role: row.Role,
        reportToEmailList,
        reportsToRoleList,
        count: 1, // Assuming each row represents one instance
      };
    });
  }
}
