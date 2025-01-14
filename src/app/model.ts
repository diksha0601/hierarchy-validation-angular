export const ROLES = {
    ROOT: 'Root',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    CALLER: 'Caller',
};

export interface ExcelRow {
    Email: string;
    FullName: string;
    Role: string;
    ReportsTo: string;
}
  
export interface TransformedRow {
    id: number;
    email: string;
    name: string;
    role: string;
    reportToEmailList: (string | null)[];
    reportsToRoleList: (string | null)[];
    count: number;
}

export interface Rule {
    role: typeof ROLES[keyof typeof ROLES]; // Ensures roles match ROLES values
    canMultiple: boolean;
    canReportTo: typeof ROLES[keyof typeof ROLES][];
    reportee: typeof ROLES[keyof typeof ROLES][];
}

export interface RunLogicReponse {
    detectCycle: boolean;
    errors: string[]
}