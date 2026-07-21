import { jsPDF } from 'jspdf';
import { EmployeeData, AnalysisResult } from '../types';

/**
 * Utility to generate a professional, high-fidelity PDF report for an employee's retention analysis.
 */
export function generateEmployeePDF(emp: EmployeeData, result: AnalysisResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.height; // 297mm
  const pageWidth = doc.internal.pageSize.width; // 210mm
  const margin = 15;
  let y = margin;

  // Color Palette Definitions
  const primaryColor = [79, 70, 229]; // Indigo Hex: #4F46E5
  const secondaryColor = [15, 118, 110]; // Teal Hex: #0F766E
  const darkTextColor = [30, 41, 59]; // Slate 800
  const lightTextColor = [100, 116, 139]; // Slate 500
  const bgLight = [248, 250, 252]; // Slate 50
  const borderGrey = [226, 232, 240]; // Slate 200

  // Alert Colors
  const highRiskColor = [225, 29, 72]; // Rose 600
  const medRiskColor = [217, 119, 6]; // Amber 600
  const lowRiskColor = [5, 150, 105]; // Emerald 600

  const getRiskColor = (level: string) => {
    if (level === 'High') return highRiskColor;
    if (level === 'Medium') return medRiskColor;
    return lowRiskColor;
  };

  // Helper to draw horizontal lines
  const drawLine = (yPos: number, thickness = 0.2, color = borderGrey) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // Helper to write styled section headers
  const drawSectionHeader = (title: string, yPos: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title.toUpperCase(), margin, yPos);
    
    // Tiny colored accent bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, yPos + 1.5, 15, 1, 'F');
    
    doc.setFont('helvetica', 'normal');
    return yPos + 8;
  };

  // --- PAGE 1: HEADER & PROFILE ---

  // Top Title Block
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NEXUS PREDICTIVE RETENTION SYSTEM', margin, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CONFIDENTIAL // INTERNAL HUMAN RESOURCES RETENTION BRIEF', margin, 21);

  // Decorative right-aligned metadata in white header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SECURITY LEVEL: HIGHLY RESTRICTED', pageWidth - margin - 55, 15);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`GENERATED: ${dateStr}`, pageWidth - margin - 55, 21);

  y = 45;

  // Header Box - Employee Focus
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'FD');

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const empName = emp.name || 'Jane Doe';
  doc.text(empName, margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(`Email: ${emp.email || 'N/A'}  |  Role: ${emp.role}`, margin + 5, y + 14);

  // Big Risk Banner inside header box (right-aligned)
  const riskColor = getRiskColor(result.riskLevel);
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.rect(pageWidth - margin - 45, y + 3, 40, 16, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('RISK PREDICTION', pageWidth - margin - 35, y + 8);
  doc.setFontSize(11);
  doc.text(`${result.riskScore}% (${result.riskLevel.toUpperCase()})`, pageWidth - margin - 40, y + 13);

  y += 32;

  // Section: Operational Profile Data
  y = drawSectionHeader('I. Operational Profile & Parameters', y);

  // Two Column Grid
  const colWidth = (pageWidth - (margin * 2)) / 2;
  const gridYStart = y;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

  // Column 1: Financial & Tenure Profile
  let col1Y = gridYStart;
  const drawMetric = (label: string, value: string, currentY: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(label, margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(value, margin + 45, currentY);
    return currentY + 7;
  };

  col1Y = drawMetric('Monthly Salary:', `INR ${emp.salary.toLocaleString('en-IN')}`, col1Y);
  col1Y = drawMetric('Satisfaction Index:', `${emp.satisfaction} / 10`, col1Y);
  col1Y = drawMetric('Transit Commute:', `${emp.commute} km`, col1Y);
  col1Y = drawMetric('Company Tenure:', `${emp.tenure} Years`, col1Y);

  // Column 2: Behavior & Overtime Profile
  let col2Y = gridYStart;
  const drawMetricRight = (label: string, value: string, currentY: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(label, margin + colWidth + 5, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(value, margin + colWidth + 50, currentY);
    return currentY + 7;
  };

  col2Y = drawMetricRight('Job Involvement:', `${emp.jobInvolvement} / 4`, col2Y);
  col2Y = drawMetricRight('Overtime Status:', emp.overTime ? 'Yes (Active / High)' : 'No (Nominal)', col2Y);
  col2Y = drawMetricRight('Predicted Flight Risk:', `${result.riskLevel} Attrition Risk`, col2Y);
  col2Y = drawMetricRight('Strategic Priority:', result.riskLevel === 'High' ? 'CRITICAL PRESERVATION' : (result.riskLevel === 'Medium' ? 'MITIGATION ADVISORY' : 'MONITOR ONLY'), col2Y);

  y = Math.max(col1Y, col2Y) + 5;
  drawLine(y - 2);

  // Section: Communication Sentiment & Risk Factors
  y = drawSectionHeader('II. Active Communication Risk Flag Analysis', y);

  // Draw table header for risk flags
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('COMMUNICATION SIGNAL', margin + 3, y + 4.5);
  doc.text('STATUS', margin + 70, y + 4.5);
  doc.text('MODEL RISK CONTRIBUTION', margin + 110, y + 4.5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const drawRiskRow = (signal: string, status: boolean, explanation: string, currentY: number): number => {
    // Row background if active
    if (status) {
      doc.setFillColor(254, 242, 242); // Very light red
      doc.rect(margin, currentY, pageWidth - (margin * 2), 7.5, 'F');
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(signal, margin + 3, currentY + 5);
    
    doc.setFont('helvetica', 'bold');
    if (status) {
      doc.setTextColor(highRiskColor[0], highRiskColor[1], highRiskColor[2]);
      doc.text('FLAGGED', margin + 70, currentY + 5);
    } else {
      doc.setTextColor(lowRiskColor[0], lowRiskColor[1], lowRiskColor[2]);
      doc.text('NOMINAL', margin + 70, currentY + 5);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(explanation, margin + 110, currentY + 5);
    
    drawLine(currentY + 7.5, 0.1);
    return currentY + 7.5;
  };

  y = drawRiskRow('Digital Volume Decline (>30%)', !!emp.emailVolumeDecline, !!emp.emailVolumeDecline ? 'Significant drop in daily messaging volume' : 'Communications baseline stable', y);
  y = drawRiskRow('Excessive After-Hours Email', !!emp.emailAfterHours, !!emp.emailAfterHours ? 'Active outbound traffic during rest intervals' : 'Respects off-hour boundaries', y);
  y = drawRiskRow('Negative Sentiment Tone', !!emp.emailSentimentRisk, !!emp.emailSentimentRisk ? 'Linguistic markers showing disengagement' : 'Overall sentiment remains neutral/positive', y);
  y = drawRiskRow('Communications Delay Gap', !!emp.emailResponseDelay, !!emp.emailResponseDelay ? 'Prolonged latency in responding to team' : 'Sufficient reply response times', y);

  y += 6;

  // Section: Logic Trace / Evaluation Rules
  y = drawSectionHeader('III. Logic Trace & Decision Tree Path', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('Below is the logical tree traversal path executed to arrive at this risk score:', margin, y);
  y += 5;

  if (result.decisionPath && result.decisionPath.length > 0) {
    result.decisionPath.forEach((step, index) => {
      // Step box
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, pageWidth - (margin * 2), 12, 'FD');

      // Index and title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`STEP ${index + 1}: ${step.step.toUpperCase()}`, margin + 3, y + 4.5);

      // Condition evaluated
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.text(`Condition: ${step.condition}`, margin + 3, y + 9);

      // Outcome of step
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Outcome: ${step.outcome}`, margin + 105, y + 6.5);

      y += 14;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('No sequential rules triggered. Base fallback prediction model active.', margin + 3, y + 3);
    y += 10;
  }

  // Footer for Page 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('NEXUS ATTRITION PREDICTOR - CONFIDENTIAL DOCUMENT', margin, pageHeight - 8);
  doc.text('Page 1 of 2', pageWidth - margin - 15, pageHeight - 8);

  // --- PAGE 2: STRATEGIC RECOMMENDATIONS & HR ACTION PLAN ---
  doc.addPage();
  y = margin + 10;

  // Header banner for Page 2
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('STRATEGIC RETENTION DIRECTIVES & HR PLAN', margin, 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`TARGET SUBJECT: ${empName} (${emp.role})`, pageWidth - margin - 70, 12);

  y = 30;

  // Section: Retention Strategies
  y = drawSectionHeader('IV. Tailored Retention Strategies & HR Directives', y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Based on the active risk factors detected in the profile, implement the following urgent directives:', margin, y);
  y += 7;

  if (result.recommendations && result.recommendations.length > 0) {
    result.recommendations.forEach((rec, index) => {
      // Directives bullet with nice bounding box
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, pageWidth - (margin * 2), 16, 'FD');

      // Bullet Point Icon / Box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin + 4, y + 5, 2, 6, 'F');

      // Directive text
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.text(`DIRECTIVE ${index + 1}:`, margin + 9, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      
      // Handle text wrapping for long recommendations
      const splitText = doc.splitTextToSize(rec, pageWidth - (margin * 2) - 15);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.setFontSize(8.5);
      doc.text(splitText, margin + 9, y + 11);

      y += 19;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('No severe alerts active. Maintain normal supervisory cycles and career development touchpoints.', margin + 3, y + 3);
    y += 10;
  }

  y += 5;

  // Section: Implementation Advisory Log
  y = drawSectionHeader('V. Retention Action Workflow Checklist', y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  
  const drawAdvisoryCheckbox = (title: string, desc: string, currentY: number): number => {
    // Checkbox outline
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.rect(margin + 2, currentY + 1, 4, 4);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(title, margin + 10, currentY + 4.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(desc, margin + 52, currentY + 4.5);
    
    drawLine(currentY + 7, 0.1);
    return currentY + 7;
  };

  y = drawAdvisoryCheckbox('Schedule Private Sync:', 'Arrange highly private, supportive 1-on-1 touchpoint within 5 business days.', y);
  y = drawAdvisoryCheckbox('Review Compensation:', 'Evaluate salary relative to role demands & transit burden mitigation.', y);
  y = drawAdvisoryCheckbox('Digital Boundaries:', 'Establish guidelines to address after-hours email burnout flags if active.', y);
  y = drawAdvisoryCheckbox('Workspace Accommodation:', 'Provide hybrid/remote options to counter transit exhaust if commute exceeds 20km.', y);

  y += 20;

  // Signatures Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('RETENTION REVIEW AUTHORIZATION', margin, y);
  y += 4;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('I have evaluated the predictive analysis outputs, logical path matching, and active risk metrics.', margin, y);
  doc.text('The retention action directives described on this sheet will be integrated into the action plans.', margin, y + 3.5);

  y += 20;

  // Signature lines side-by-side
  const sigColWidth = (pageWidth - (margin * 2) - 15) / 2;
  
  // Left Signature
  doc.line(margin, y, margin + sigColWidth, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('HR Business Partner Signature', margin, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('Date: ________________________', margin, y + 9);

  // Right Signature
  doc.line(margin + sigColWidth + 15, y, pageWidth - margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Department Manager Signature', margin + sigColWidth + 15, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('Date: ________________________', margin + sigColWidth + 15, y + 9);

  // Footer for Page 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('NEXUS ATTRITION PREDICTOR - CONFIDENTIAL DOCUMENT', margin, pageHeight - 8);
  doc.text('Page 2 of 2', pageWidth - margin - 15, pageHeight - 8);

  // Save the PDF
  const sanitizedName = empName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  doc.save(`nexus_retention_report_${sanitizedName}.pdf`);
}
