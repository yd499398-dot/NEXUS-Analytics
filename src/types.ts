export interface DecisionStep {
  step: string;
  condition: string;
  outcome: string;
}

export interface AnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  decisionPath: DecisionStep[];
  recommendations: string[];
}

export interface EmployeeData {
  role: string;
  salary: number;
  commute: number;
  satisfaction: number;
  tenure: number;
  overTime: boolean;
  jobInvolvement: number;
  emailVolumeDecline?: boolean;
  emailAfterHours?: boolean;
  emailSentimentRisk?: boolean;
  emailResponseDelay?: boolean;
  name?: string;
  email?: string;
}
