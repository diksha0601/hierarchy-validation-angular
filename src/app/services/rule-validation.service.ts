import { Injectable } from '@angular/core';
import { RULES, ERROR_MESSAGES } from './role-validation.constant';
import { ExcelRow, Rule, RunLogicReponse, TransformedRow } from '../model';

@Injectable({
  providedIn: 'root',
})
export class RuleValidationService {
  constructor() { }

  private passRule(excelRow: TransformedRow, rule: Rule, rowNumber: number): string[] {
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

    for (let i = 0; i < excelRow.reportsToRoleList.length; i++) {
      const reportToRole: string = excelRow.reportsToRoleList[i] ?? '';
      const reportToEmail = excelRow.reportToEmailList[i];
      if (reportToRole !== '' && !rule.canReportTo.includes(reportToRole)) {
        errors.push(ERROR_MESSAGES.INVALID_REPORT_TO(rowNumber, excelRow.role, reportToRole, excelRow.email, excelRow.name, reportToEmail));
      }
    }

    return errors;
  }

  checkCyclicDependency(graph: Map<string, string[]>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) {
        return true;
      }
      if (visited.has(node)) {
        return false; 
      }

      visited.add(node);
      recursionStack.add(node);

      for (const neighbor of graph.get(node) || []) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return true;
        }
      }
    }
    return false;
  }

  buildGraph(excelRows: TransformedRow[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    excelRows.forEach((row) => {
      const fromNode = row.email;
      row.reportToEmailList
        .filter((toNode) => toNode !== null)
        .forEach((toNode) => {
          if (!graph.has(fromNode)) {
            graph.set(fromNode, []);
          }
          graph.get(fromNode)!.push(toNode!);
        });
    });

    return graph;
  }


  runLogic(excelRows: TransformedRow[]): RunLogicReponse {
    const returnedErrors: string[] = [];   
    const graph = this.buildGraph(excelRows);

    // Check for cycles in the graph
    if (this.checkCyclicDependency(graph)) {
      return {
        detectCycle: true,
        errors: ["Cycle is detected in hierarchy"]
      };
    }

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

    return {
      detectCycle: false,
      errors: returnedErrors
    };
  }

  transformExcelData(excelData: ExcelRow[]): TransformedRow[] {
    return excelData.map((row, index) => {
      const reportToEmailList = row.ReportsTo.split(';').filter((email) => email.trim() !== '');
      const reportsToRoleList: (string | null)[] = reportToEmailList.map((email) => {
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
