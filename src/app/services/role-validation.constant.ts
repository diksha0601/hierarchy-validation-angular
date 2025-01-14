import { ROLES, Rule } from "../model";

export const RULES: Readonly<Rule[]> = [
  {
    role: ROLES.ROOT,
    canMultiple: false,
    canReportTo: [],
    reportee: [ROLES.ADMIN],
  },
  {
    role: ROLES.ADMIN,
    canMultiple: true,
    canReportTo: [ROLES.ROOT],
    reportee: [ROLES.MANAGER],
  },
  {
    role: ROLES.MANAGER,
    canMultiple: true,
    canReportTo: [ROLES.ADMIN, ROLES.MANAGER],
    reportee: [ROLES.MANAGER, ROLES.CALLER],
  },
  {
    role: ROLES.CALLER,
    canMultiple: true,
    canReportTo: [ROLES.MANAGER],
    reportee: [],
  },
];

export const ERROR_MESSAGES = {
  MULTIPLE_INSTANCE_ERROR: (rowNumber: number, role: string) =>
    `Row ${rowNumber}: ${role} cannot have multiple instances as 'canMultiple' is set to false.`,
  INVALID_REPORT_TO: (rowNumber: number, role: string, reportsToRole: string | null, userEmail: string, fullName: string, reporteeEmail: string | null) =>
    `Row ${rowNumber} (${userEmail}): ${fullName} is a ${role} but report to ${reporteeEmail} (a ${reportsToRole}).`,
  INVALID_REPORTEES: (rowNumber: number, role: string, invalidReportee: string) =>
    `Row ${rowNumber}: ${role} cannot have ${invalidReportee} as a reportee. This violates the 'reportee' rule.`,
  UNDEFINED_RULE: (rowNumber: number, role: string) =>
    `Row ${rowNumber}: No rule is defined for the role: ${role}.`,
  MULTIPLE_REPORTING: (rowNumber: number, role: string, userEmail: string, userName: string, reporteeEmails: string) =>
    `Row ${rowNumber} (${userEmail}): ${userName} is a ${role} who reports to multiple emails: ${reporteeEmails}`,
  CYCLE_ERROR: (rowNumber: number, userEmail: string) =>
    `Row ${rowNumber} (${userEmail}) is a part of cycle in hierarchy!`,
};


