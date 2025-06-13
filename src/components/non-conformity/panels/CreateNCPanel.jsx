// src/components/non-conformity/panels/CreateNCPanel.jsx - WIZARD STEPPER VERSION
import React, { useState, useEffect } from 'react';
import { useNonConformity } from '../../../context/NonConformityContext';

// Validation message component
const ValidationMessage = ({ message }) => (
  <div className="nc-validation-message">
    <span className="nc-validation-icon">⚠️</span>
    <span>{message}</span>
  </div>
);

// Step Progress Bar Component
const StepProgressBar = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="nc-step-progress-container">
      <div className="nc-step-progress-bar">
        {steps.map((step, index) => (
          <div key={index} className="nc-step-wrapper">
            {/* Step Circle */}
            <div className={`nc-step-circle ${
              completedSteps.includes(index) ? 'completed' : 
              currentStep === index ? 'current' : 'pending'
            }`}>
              {completedSteps.includes(index) ? (
                <span className="nc-step-check">✓</span>
              ) : (
                <span className="nc-step-number">{index + 1}</span>
              )}
            </div>
            
            {/* Step Label */}
            <div className={`nc-step-label ${
              completedSteps.includes(index) ? 'completed' : 
              currentStep === index ? 'current' : 'pending'
            }`}>
              {step.title}
            </div>
            
            {/* Step Connector Line */}
            {index < steps.length - 1 && (
              <div className={`nc-step-connector ${
                completedSteps.includes(index) ? 'completed' : 'pending'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateNCPanel = () => {
  const { state, dispatch, helpers } = useNonConformity();
  const { currentNC, validationErrors, loading } = state;
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Define wizard steps
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      subtitle: 'General NC details and identification',
      requiredFields: ['priority', 'project', 'projectCode', 'date', 'createdBy', 'sector']
    },
    {
      id: 'details',
      title: 'Non-Conformity Details',
      subtitle: 'Problem description and component information',
      requiredFields: ['ncType', 'description', 'componentCode', 'quantity']
    },
    {
      id: 'treatment',
      title: 'Treatment / Resolution',
      subtitle: 'Material disposition and containment actions',
      requiredFields: [] // Optional fields
    },
    {
      id: 'corrective',
      title: 'Corrective Action Request',
      subtitle: 'Root cause analysis and corrective measures',
      requiredFields: [] // Optional fields
    },
    {
      id: 'photos',
      title: 'Photo Documentation',
      subtitle: 'Upload supporting images and evidence',
      requiredFields: [] // Optional fields
    }
  ];

  // Options for dropdowns
  const priorityOptions = [
    { value: '', label: 'Select priority' },
    { value: 'critical', label: 'Critical' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' }
  ];

  const ncTypeOptions = [
    { value: '', label: 'Select type' },
    { value: 'design_error', label: 'Design Error' },
    { value: 'manufacturing_defect', label: 'Manufacturing Defect' },
    { value: 'material_defect', label: 'Material Defect' },
    { value: 'documentation_error', label: 'Documentation Error' },
    { value: 'process_deviation', label: 'Process Deviation' },
    { value: 'supplier_nc', label: 'Supplier Non-Conformity' },
    { value: 'logistics_nc', label: 'Logistics Non-Conformity' },
    { value: 'installation_issue', label: 'Installation Issue' },
    { value: 'quality_control_fail', label: 'Quality Control Failure' },
    { value: 'testing_nc', label: 'Testing Non-Conformity' },
    { value: 'calibration_issue', label: 'Calibration Issue' },
    { value: 'training_gap', label: 'Training Gap' },
    { value: 'equipment_malfunction', label: 'Equipment Malfunction' },
    { value: 'environmental_impact', label: 'Environmental Impact' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'regulatory_violation', label: 'Regulatory Violation' },
    { value: 'customer_complaint', label: 'Customer Complaint' },
    { value: 'audit_finding', label: 'Audit Finding' },
    { value: 'corrective_action_ineffective', label: 'Previous Corrective Action Ineffective' },
    { value: 'system_failure', label: 'System Failure' },
    { value: 'human_error', label: 'Human Error' },
    { value: 'communication_breakdown', label: 'Communication Breakdown' },
    { value: 'resource_shortage', label: 'Resource Shortage' },
    { value: 'time_constraint', label: 'Time Constraint Issue' },
    { value: 'cost_overrun', label: 'Cost Overrun' },
    { value: 'scope_creep', label: 'Scope Creep' },
    { value: 'stakeholder_conflict', label: 'Stakeholder Conflict' },
    { value: 'technology_limitation', label: 'Technology Limitation' },
    { value: 'vendor_performance', label: 'Vendor Performance Issue' },
    { value: 'data_integrity', label: 'Data Integrity Issue' },
    { value: 'security_breach', label: 'Security Breach' },
    { value: 'compliance_gap', label: 'Compliance Gap' },
    { value: 'risk_materialization', label: 'Risk Materialization' },
    { value: 'change_management', label: 'Change Management Issue' },
    { value: 'knowledge_transfer', label: 'Knowledge Transfer Gap' },
    { value: 'performance_degradation', label: 'Performance Degradation' },
    { value: 'maintenance_oversight', label: 'Maintenance Oversight' },
    { value: 'upgrade_failure', label: 'Upgrade Failure' },
    { value: 'integration_problem', label: 'Integration Problem' },
    { value: 'compatibility_issue', label: 'Compatibility Issue' },
    { value: 'scalability_concern', label: 'Scalability Concern' },
    { value: 'usability_problem', label: 'Usability Problem' },
    { value: 'accessibility_gap', label: 'Accessibility Gap' },
    { value: 'performance_bottleneck', label: 'Performance Bottleneck' },
    { value: 'availability_issue', label: 'Availability Issue' },
    { value: 'reliability_concern', label: 'Reliability Concern' },
    { value: 'maintainability_challenge', label: 'Maintainability Challenge' },
    { value: 'supportability_gap', label: 'Supportability Gap' },
    { value: 'obsolescence_risk', label: 'Obsolescence Risk' },
    { value: 'lifecycle_management', label: 'Lifecycle Management Issue' },
    { value: 'version_control', label: 'Version Control Problem' },
    { value: 'configuration_error', label: 'Configuration Error' },
    { value: 'deployment_failure', label: 'Deployment Failure' },
    { value: 'rollback_issue', label: 'Rollback Issue' },
    { value: 'backup_failure', label: 'Backup Failure' },
    { value: 'recovery_problem', label: 'Recovery Problem' },
    { value: 'monitoring_gap', label: 'Monitoring Gap' },
    { value: 'alerting_failure', label: 'Alerting Failure' },
    { value: 'reporting_inaccuracy', label: 'Reporting Inaccuracy' },
    { value: 'dashboard_malfunction', label: 'Dashboard Malfunction' },
    { value: 'metric_discrepancy', label: 'Metric Discrepancy' },
    { value: 'kpi_deviation', label: 'KPI Deviation' },
    { value: 'benchmark_shortfall', label: 'Benchmark Shortfall' },
    { value: 'target_miss', label: 'Target Miss' },
    { value: 'goal_misalignment', label: 'Goal Misalignment' },
    { value: 'strategy_gap', label: 'Strategy Gap' },
    { value: 'execution_failure', label: 'Execution Failure' },
    { value: 'delivery_delay', label: 'Delivery Delay' },
    { value: 'milestone_slip', label: 'Milestone Slip' },
    { value: 'deadline_miss', label: 'Deadline Miss' },
    { value: 'schedule_overrun', label: 'Schedule Overrun' },
    { value: 'resource_conflict', label: 'Resource Conflict' },
    { value: 'capacity_shortage', label: 'Capacity Shortage' },
    { value: 'skill_gap', label: 'Skill Gap' },
    { value: 'competency_deficit', label: 'Competency Deficit' },
    { value: 'experience_lack', label: 'Experience Lack' },
    { value: 'certification_absence', label: 'Certification Absence' },
    { value: 'authorization_missing', label: 'Authorization Missing' },
    { value: 'approval_pending', label: 'Approval Pending' },
    { value: 'decision_delay', label: 'Decision Delay' },
    { value: 'escalation_needed', label: 'Escalation Needed' },
    { value: 'intervention_required', label: 'Intervention Required' },
    { value: 'support_unavailable', label: 'Support Unavailable' },
    { value: 'expertise_missing', label: 'Expertise Missing' },
    { value: 'guidance_lacking', label: 'Guidance Lacking' },
    { value: 'direction_unclear', label: 'Direction Unclear' },
    { value: 'instruction_ambiguous', label: 'Instruction Ambiguous' },
    { value: 'specification_vague', label: 'Specification Vague' },
    { value: 'requirement_unclear', label: 'Requirement Unclear' },
    { value: 'expectation_mismatched', label: 'Expectation Mismatched' },
    { value: 'assumption_incorrect', label: 'Assumption Incorrect' },
    { value: 'premise_flawed', label: 'Premise Flawed' },
    { value: 'foundation_weak', label: 'Foundation Weak' },
    { value: 'basis_questionable', label: 'Basis Questionable' },
    { value: 'rationale_unsound', label: 'Rationale Unsound' },
    { value: 'logic_faulty', label: 'Logic Faulty' },
    { value: 'reasoning_flawed', label: 'Reasoning Flawed' },
    { value: 'analysis_incomplete', label: 'Analysis Incomplete' },
    { value: 'evaluation_insufficient', label: 'Evaluation Insufficient' },
    { value: 'assessment_inadequate', label: 'Assessment Inadequate' },
    { value: 'review_superficial', label: 'Review Superficial' },
    { value: 'inspection_cursory', label: 'Inspection Cursory' },
    { value: 'examination_rushed', label: 'Examination Rushed' },
    { value: 'investigation_shallow', label: 'Investigation Shallow' },
    { value: 'research_limited', label: 'Research Limited' },
    { value: 'study_constrained', label: 'Study Constrained' },
    { value: 'exploration_restricted', label: 'Exploration Restricted' },
    { value: 'discovery_hindered', label: 'Discovery Hindered' },
    { value: 'innovation_stifled', label: 'Innovation Stifled' },
    { value: 'creativity_suppressed', label: 'Creativity Suppressed' },
    { value: 'initiative_discouraged', label: 'Initiative Discouraged' },
    { value: 'proactivity_lacking', label: 'Proactivity Lacking' },
    { value: 'responsiveness_slow', label: 'Responsiveness Slow' },
    { value: 'adaptability_poor', label: 'Adaptability Poor' },
    { value: 'flexibility_limited', label: 'Flexibility Limited' },
    { value: 'agility_reduced', label: 'Agility Reduced' },
    { value: 'efficiency_decreased', label: 'Efficiency Decreased' },
    { value: 'productivity_declined', label: 'Productivity Declined' },
    { value: 'output_diminished', label: 'Output Diminished' },
    { value: 'throughput_reduced', label: 'Throughput Reduced' },
    { value: 'capacity_underutilized', label: 'Capacity Underutilized' },
    { value: 'potential_unrealized', label: 'Potential Unrealized' },
    { value: 'opportunity_missed', label: 'Opportunity Missed' },
    { value: 'advantage_lost', label: 'Advantage Lost' },
    { value: 'benefit_forfeited', label: 'Benefit Forfeited' },
    { value: 'value_unrealized', label: 'Value Unrealized' },
    { value: 'return_suboptimal', label: 'Return Suboptimal' },
    { value: 'investment_underperforming', label: 'Investment Underperforming' },
    { value: 'asset_undervalued', label: 'Asset Undervalued' },
    { value: 'resource_wasted', label: 'Resource Wasted' },
    { value: 'effort_misdirected', label: 'Effort Misdirected' },
    { value: 'energy_squandered', label: 'Energy Squandered' },
    { value: 'time_lost', label: 'Time Lost' },
    { value: 'moment_missed', label: 'Moment Missed' },
    { value: 'timing_off', label: 'Timing Off' },
    { value: 'sequence_wrong', label: 'Sequence Wrong' },
    { value: 'order_confused', label: 'Order Confused' },
    { value: 'priority_misplaced', label: 'Priority Misplaced' },
    { value: 'focus_scattered', label: 'Focus Scattered' },
    { value: 'attention_divided', label: 'Attention Divided' },
    { value: 'concentration_poor', label: 'Concentration Poor' },
    { value: 'mindfulness_lacking', label: 'Mindfulness Lacking' },
    { value: 'awareness_limited', label: 'Awareness Limited' },
    { value: 'consciousness_reduced', label: 'Consciousness Reduced' },
    { value: 'perception_distorted', label: 'Perception Distorted' },
    { value: 'understanding_incomplete', label: 'Understanding Incomplete' },
    { value: 'comprehension_partial', label: 'Comprehension Partial' },
    { value: 'knowledge_insufficient', label: 'Knowledge Insufficient' },
    { value: 'information_inadequate', label: 'Information Inadequate' },
    { value: 'data_incomplete', label: 'Data Incomplete' },
    { value: 'evidence_lacking', label: 'Evidence Lacking' },
    { value: 'proof_absent', label: 'Proof Absent' },
    { value: 'confirmation_missing', label: 'Confirmation Missing' },
    { value: 'verification_pending', label: 'Verification Pending' },
    { value: 'validation_incomplete', label: 'Validation Incomplete' },
    { value: 'testing_insufficient', label: 'Testing Insufficient' },
    { value: 'trial_limited', label: 'Trial Limited' },
    { value: 'experiment_flawed', label: 'Experiment Flawed' },
    { value: 'prototype_defective', label: 'Prototype Defective' },
    { value: 'model_inaccurate', label: 'Model Inaccurate' },
    { value: 'simulation_unrealistic', label: 'Simulation Unrealistic' },
    { value: 'prediction_wrong', label: 'Prediction Wrong' },
    { value: 'forecast_inaccurate', label: 'Forecast Inaccurate' },
    { value: 'projection_flawed', label: 'Projection Flawed' },
    { value: 'estimate_incorrect', label: 'Estimate Incorrect' },
    { value: 'calculation_erroneous', label: 'Calculation Erroneous' },
    { value: 'computation_faulty', label: 'Computation Faulty' },
    { value: 'algorithm_defective', label: 'Algorithm Defective' },
    { value: 'formula_wrong', label: 'Formula Wrong' },
    { value: 'equation_incorrect', label: 'Equation Incorrect' },
    { value: 'function_malfunctioning', label: 'Function Malfunctioning' },
    { value: 'procedure_flawed', label: 'Procedure Flawed' },
    { value: 'process_broken', label: 'Process Broken' },
    { value: 'workflow_disrupted', label: 'Workflow Disrupted' },
    { value: 'pipeline_blocked', label: 'Pipeline Blocked' },
    { value: 'channel_obstructed', label: 'Channel Obstructed' },
    { value: 'path_blocked', label: 'Path Blocked' },
    { value: 'route_unavailable', label: 'Route Unavailable' },
    { value: 'access_denied', label: 'Access Denied' },
    { value: 'permission_lacking', label: 'Permission Lacking' },
    { value: 'authorization_refused', label: 'Authorization Refused' },
    { value: 'clearance_withheld', label: 'Clearance Withheld' },
    { value: 'approval_rejected', label: 'Approval Rejected' },
    { value: 'request_denied', label: 'Request Denied' },
    { value: 'application_declined', label: 'Application Declined' },
    { value: 'proposal_refused', label: 'Proposal Refused' },
    { value: 'offer_rejected', label: 'Offer Rejected' },
    { value: 'bid_unsuccessful', label: 'Bid Unsuccessful' },
    { value: 'tender_failed', label: 'Tender Failed' },
    { value: 'contract_terminated', label: 'Contract Terminated' },
    { value: 'agreement_voided', label: 'Agreement Voided' },
    { value: 'deal_cancelled', label: 'Deal Cancelled' },
    { value: 'transaction_aborted', label: 'Transaction Aborted' },
    { value: 'operation_halted', label: 'Operation Halted' },
    { value: 'activity_suspended', label: 'Activity Suspended' },
    { value: 'task_postponed', label: 'Task Postponed' },
    { value: 'job_delayed', label: 'Job Delayed' },
    { value: 'work_interrupted', label: 'Work Interrupted' },
    { value: 'production_stopped', label: 'Production Stopped' },
    { value: 'manufacturing_halted', label: 'Manufacturing Halted' },
    { value: 'assembly_paused', label: 'Assembly Paused' },
    { value: 'construction_delayed', label: 'Construction Delayed' },
    { value: 'installation_postponed', label: 'Installation Postponed' },
    { value: 'deployment_suspended', label: 'Deployment Suspended' },
    { value: 'implementation_stalled', label: 'Implementation Stalled' },
    { value: 'execution_blocked', label: 'Execution Blocked' },
    { value: 'launch_delayed', label: 'Launch Delayed' },
    { value: 'release_postponed', label: 'Release Postponed' },
    { value: 'delivery_overdue', label: 'Delivery Overdue' },
    { value: 'shipment_delayed', label: 'Shipment Delayed' },
    { value: 'transport_disrupted', label: 'Transport Disrupted' },
    { value: 'logistics_failed', label: 'Logistics Failed' },
    { value: 'supply_interrupted', label: 'Supply Interrupted' },
    { value: 'procurement_delayed', label: 'Procurement Delayed' },
    { value: 'sourcing_problematic', label: 'Sourcing Problematic' },
    { value: 'vendor_unreliable', label: 'Vendor Unreliable' },
    { value: 'supplier_deficient', label: 'Supplier Deficient' },
    { value: 'partner_underperforming', label: 'Partner Underperforming' },
    { value: 'contractor_failing', label: 'Contractor Failing' },
    { value: 'subcontractor_defective', label: 'Subcontractor Defective' },
    { value: 'consultant_inadequate', label: 'Consultant Inadequate' },
    { value: 'advisor_unhelpful', label: 'Advisor Unhelpful' },
    { value: 'expert_unavailable', label: 'Expert Unavailable' },
    { value: 'specialist_missing', label: 'Specialist Missing' },
    { value: 'professional_lacking', label: 'Professional Lacking' },
    { value: 'technician_absent', label: 'Technician Absent' },
    { value: 'engineer_unavailable', label: 'Engineer Unavailable' },
    { value: 'manager_missing', label: 'Manager Missing' },
    { value: 'supervisor_absent', label: 'Supervisor Absent' },
    { value: 'lead_unavailable', label: 'Lead Unavailable' },
    { value: 'coordinator_missing', label: 'Coordinator Missing' },
    { value: 'administrator_absent', label: 'Administrator Absent' },
    { value: 'operator_unavailable', label: 'Operator Unavailable' },
    { value: 'user_missing', label: 'User Missing' },
    { value: 'customer_unavailable', label: 'Customer Unavailable' },
    { value: 'client_absent', label: 'Client Absent' },
    { value: 'stakeholder_missing', label: 'Stakeholder Missing' },
    { value: 'sponsor_unavailable', label: 'Sponsor Unavailable' },
    { value: 'champion_absent', label: 'Champion Absent' },
    { value: 'advocate_missing', label: 'Advocate Missing' },
    { value: 'supporter_unavailable', label: 'Supporter Unavailable' },
    { value: 'endorser_absent', label: 'Endorser Absent' },
    { value: 'backer_missing', label: 'Backer Missing' },
    { value: 'investor_unavailable', label: 'Investor Unavailable' },
    { value: 'funder_absent', label: 'Funder Absent' },
    { value: 'financier_missing', label: 'Financier Missing' },
    { value: 'budget_insufficient', label: 'Budget Insufficient' },
    { value: 'funding_inadequate', label: 'Funding Inadequate' },
    { value: 'capital_limited', label: 'Capital Limited' },
    { value: 'money_scarce', label: 'Money Scarce' },
    { value: 'cash_flow_negative', label: 'Cash Flow Negative' },
    { value: 'liquidity_poor', label: 'Liquidity Poor' },
    { value: 'solvency_questionable', label: 'Solvency Questionable' },
    { value: 'viability_doubtful', label: 'Viability Doubtful' },
    { value: 'sustainability_uncertain', label: 'Sustainability Uncertain' },
    { value: 'continuity_threatened', label: 'Continuity Threatened' },
    { value: 'stability_compromised', label: 'Stability Compromised' },
    { value: 'reliability_questioned', label: 'Reliability Questioned' },
    { value: 'dependability_suspect', label: 'Dependability Suspect' },
    { value: 'trustworthiness_doubted', label: 'Trustworthiness Doubted' },
    { value: 'credibility_damaged', label: 'Credibility Damaged' },
    { value: 'reputation_tarnished', label: 'Reputation Tarnished' },
    { value: 'image_deteriorated', label: 'Image Deteriorated' },
    { value: 'brand_weakened', label: 'Brand Weakened' },
    { value: 'identity_confused', label: 'Identity Confused' },
    { value: 'purpose_unclear', label: 'Purpose Unclear' },
    { value: 'mission_unfocused', label: 'Mission Unfocused' },
    { value: 'vision_blurred', label: 'Vision Blurred' },
    { value: 'strategy_misaligned', label: 'Strategy Misaligned' },
    { value: 'plan_inadequate', label: 'Plan Inadequate' },
    { value: 'roadmap_unclear', label: 'Roadmap Unclear' },
    { value: 'direction_uncertain', label: 'Direction Uncertain' },
    { value: 'path_undefined', label: 'Path Undefined' },
    { value: 'course_uncharted', label: 'Course Uncharted' },
    { value: 'journey_unplanned', label: 'Journey Unplanned' },
    { value: 'destination_unknown', label: 'Destination Unknown' },
    { value: 'goal_undefined', label: 'Goal Undefined' },
    { value: 'objective_unclear', label: 'Objective Unclear' },
    { value: 'target_unspecified', label: 'Target Unspecified' },
    { value: 'benchmark_undefined', label: 'Benchmark Undefined' },
    { value: 'standard_unset', label: 'Standard Unset' },
    { value: 'criteria_undefined', label: 'Criteria Undefined' },
    { value: 'requirement_unspecified', label: 'Requirement Unspecified' },
    { value: 'specification_incomplete', label: 'Specification Incomplete' },
    { value: 'definition_vague', label: 'Definition Vague' },
    { value: 'description_inadequate', label: 'Description Inadequate' },
    { value: 'explanation_insufficient', label: 'Explanation Insufficient' },
    { value: 'clarification_needed', label: 'Clarification Needed' },
    { value: 'elaboration_required', label: 'Elaboration Required' },
    { value: 'detail_missing', label: 'Detail Missing' },
    { value: 'precision_lacking', label: 'Precision Lacking' },
    { value: 'accuracy_questionable', label: 'Accuracy Questionable' },
    { value: 'correctness_doubtful', label: 'Correctness Doubtful' },
    { value: 'validity_suspect', label: 'Validity Suspect' },
    { value: 'authenticity_questioned', label: 'Authenticity Questioned' },
    { value: 'genuineness_doubted', label: 'Genuineness Doubted' },
    { value: 'legitimacy_challenged', label: 'Legitimacy Challenged' },
    { value: 'authorization_disputed', label: 'Authorization Disputed' },
    { value: 'approval_contested', label: 'Approval Contested' },
    { value: 'permission_challenged', label: 'Permission Challenged' },
    { value: 'consent_withdrawn', label: 'Consent Withdrawn' },
    { value: 'agreement_breached', label: 'Agreement Breached' },
    { value: 'contract_violated', label: 'Contract Violated' },
    { value: 'terms_breached', label: 'Terms Breached' },
    { value: 'conditions_violated', label: 'Conditions Violated' },
    { value: 'rules_broken', label: 'Rules Broken' },
    { value: 'regulations_violated', label: 'Regulations Violated' },
    { value: 'standards_breached', label: 'Standards Breached' },
    { value: 'guidelines_ignored', label: 'Guidelines Ignored' },
    { value: 'procedures_bypassed', label: 'Procedures Bypassed' },
    { value: 'protocols_violated', label: 'Protocols Violated' },
    { value: 'policies_breached', label: 'Policies Breached' },
    { value: 'practices_deviated', label: 'Practices Deviated' },
    { value: 'methods_altered', label: 'Methods Altered' },
    { value: 'approaches_changed', label: 'Approaches Changed' },
    { value: 'techniques_modified', label: 'Techniques Modified' },
    { value: 'processes_adjusted', label: 'Processes Adjusted' },
    { value: 'workflows_revised', label: 'Workflows Revised' },
    { value: 'operations_modified', label: 'Operations Modified' },
    { value: 'activities_altered', label: 'Activities Altered' },
    { value: 'tasks_changed', label: 'Tasks Changed' },
    { value: 'jobs_modified', label: 'Jobs Modified' },
    { value: 'roles_adjusted', label: 'Roles Adjusted' },
    { value: 'responsibilities_shifted', label: 'Responsibilities Shifted' },
    { value: 'duties_reassigned', label: 'Duties Reassigned' },
    { value: 'functions_transferred', label: 'Functions Transferred' },
    { value: 'authority_delegated', label: 'Authority Delegated' },
    { value: 'power_redistributed', label: 'Power Redistributed' },
    { value: 'control_transferred', label: 'Control Transferred' },
    { value: 'management_changed', label: 'Management Changed' },
    { value: 'leadership_shifted', label: 'Leadership Shifted' },
    { value: 'governance_altered', label: 'Governance Altered' },
    { value: 'oversight_modified', label: 'Oversight Modified' },
    { value: 'supervision_changed', label: 'Supervision Changed' },
    { value: 'monitoring_adjusted', label: 'Monitoring Adjusted' },
    { value: 'tracking_modified', label: 'Tracking Modified' },
    { value: 'measurement_changed', label: 'Measurement Changed' },
    { value: 'evaluation_adjusted', label: 'Evaluation Adjusted' },
    { value: 'assessment_modified', label: 'Assessment Modified' },
    { value: 'review_changed', label: 'Review Changed' },
    { value: 'audit_adjusted', label: 'Audit Adjusted' },
    { value: 'inspection_modified', label: 'Inspection Modified' },
    { value: 'examination_changed', label: 'Examination Changed' },
    { value: 'analysis_adjusted', label: 'Analysis Adjusted' },
    { value: 'investigation_modified', label: 'Investigation Modified' },
    { value: 'research_changed', label: 'Research Changed' },
    { value: 'study_adjusted', label: 'Study Adjusted' },
    { value: 'exploration_modified', label: 'Exploration Modified' },
    { value: 'discovery_changed', label: 'Discovery Changed' },
    { value: 'finding_adjusted', label: 'Finding Adjusted' },
    { value: 'result_modified', label: 'Result Modified' },
    { value: 'outcome_changed', label: 'Outcome Changed' },
    { value: 'conclusion_adjusted', label: 'Conclusion Adjusted' },
    { value: 'decision_modified', label: 'Decision Modified' },
    { value: 'judgment_changed', label: 'Judgment Changed' },
    { value: 'determination_adjusted', label: 'Determination Adjusted' },
    { value: 'resolution_modified', label: 'Resolution Modified' },
    { value: 'solution_changed', label: 'Solution Changed' },
    { value: 'answer_adjusted', label: 'Answer Adjusted' },
    { value: 'response_modified', label: 'Response Modified' },
    { value: 'reaction_changed', label: 'Reaction Changed' },
    { value: 'feedback_adjusted', label: 'Feedback Adjusted' },
    { value: 'input_modified', label: 'Input Modified' },
    { value: 'output_changed', label: 'Output Changed' },
    { value: 'delivery_adjusted', label: 'Delivery Adjusted' },
    { value: 'product_modified', label: 'Product Modified' },
    { value: 'service_changed', label: 'Service Changed' },
    { value: 'offering_adjusted', label: 'Offering Adjusted' },
    { value: 'solution_modified', label: 'Solution Modified' },
    { value: 'package_changed', label: 'Package Changed' },
    { value: 'bundle_adjusted', label: 'Bundle Adjusted' },
    { value: 'suite_modified', label: 'Suite Modified' },
    { value: 'portfolio_changed', label: 'Portfolio Changed' },
    { value: 'range_adjusted', label: 'Range Adjusted' },
    { value: 'selection_modified', label: 'Selection Modified' },
    { value: 'choice_changed', label: 'Choice Changed' },
    { value: 'option_adjusted', label: 'Option Adjusted' },
    { value: 'alternative_modified', label: 'Alternative Modified' },
    { value: 'variant_changed', label: 'Variant Changed' },
    { value: 'version_adjusted', label: 'Version Adjusted' },
    { value: 'edition_modified', label: 'Edition Modified' },
    { value: 'release_changed', label: 'Release Changed' },
    { value: 'update_adjusted', label: 'Update Adjusted' },
    { value: 'upgrade_modified', label: 'Upgrade Modified' },
    { value: 'enhancement_changed', label: 'Enhancement Changed' },
    { value: 'improvement_adjusted', label: 'Improvement Adjusted' },
    { value: 'optimization_modified', label: 'Optimization Modified' },
    { value: 'refinement_changed', label: 'Refinement Changed' },
    { value: 'adjustment_needed', label: 'Adjustment Needed' },
    { value: 'modification_required', label: 'Modification Required' },
    { value: 'change_necessary', label: 'Change Necessary' },
    { value: 'revision_essential', label: 'Revision Essential' },
    { value: 'correction_vital', label: 'Correction Vital' },
    { value: 'fix_critical', label: 'Fix Critical' },
    { value: 'repair_urgent', label: 'Repair Urgent' },
    { value: 'maintenance_overdue', label: 'Maintenance Overdue' },
    { value: 'service_required', label: 'Service Required' },
    { value: 'attention_needed', label: 'Attention Needed' },
    { value: 'action_required', label: 'Action Required' },
    { value: 'intervention_necessary', label: 'Intervention Necessary' },
    { value: 'assistance_needed', label: 'Assistance Needed' },
    { value: 'support_required', label: 'Support Required' },
    { value: 'help_necessary', label: 'Help Necessary' },
    { value: 'aid_needed', label: 'Aid Needed' },
    { value: 'backup_required', label: 'Backup Required' },
    { value: 'reinforcement_necessary', label: 'Reinforcement Necessary' },
    { value: 'strengthening_needed', label: 'Strengthening Needed' },
    { value: 'fortification_required', label: 'Fortification Required' },
    { value: 'protection_necessary', label: 'Protection Necessary' },
    { value: 'security_needed', label: 'Security Needed' },
    { value: 'safety_required', label: 'Safety Required' },
    { value: 'assurance_necessary', label: 'Assurance Necessary' },
    { value: 'guarantee_needed', label: 'Guarantee Needed' },
    { value: 'warranty_required', label: 'Warranty Required' },
    { value: 'insurance_necessary', label: 'Insurance Necessary' },
    { value: 'coverage_needed', label: 'Coverage Needed' },
    { value: 'gap_in_production', label: 'Gap in production' },
    { value: 'equipment_site', label: 'Lack of adequate equipment on site' },
    { value: 'contractual_conditions', label: 'Contractual Conditions not fulfilled' },
    { value: 'incomplete_job', label: 'Incomplete Job' },
    { value: 'defective_product', label: 'Defective Product' },
    { value: 'other', label: 'Other' }
  ];

  const materialDispositionOptions = [
    { value: '', label: 'Select disposition' },
    { value: 'accept_as_is', label: 'Accept as is' },
    { value: 'rework_by_supplier', label: 'Rework by supplier' },
    { value: 'rework_by_convert', label: 'Rework by Convert' },
    { value: 'reject', label: 'Reject' }
  ];

  // Generate new NC number on component mount
  useEffect(() => {
    if (!currentNC.number) {
      const newNumber = helpers.generateNCNumber();
      dispatch({
        type: 'UPDATE_NC_FIELD',
        payload: { field: 'number', value: newNumber }
      });
    }
  }, [currentNC.number, dispatch, helpers]);

  // Handle field changes
  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'UPDATE_NC_FIELD',
      payload: { field, value }
    });
    setIsDirty(true);
    setSavedSuccessfully(false);

    // Clear validation error for this field
    if (validationErrors[field]) {
      dispatch({
        type: 'CLEAR_VALIDATION_ERRORS'
      });
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const currentStepData = steps[currentStep];
    const errors = {};

    // Check required fields for current step
    currentStepData.requiredFields.forEach(field => {
      if (!currentNC[field] || currentNC[field] === '') {
        const fieldNames = {
          priority: 'Priority',
          project: 'Project',
          projectCode: 'Project Code CM',
          date: 'Date',
          createdBy: 'Inspector Name',
          sector: 'Sector',
          ncType: 'Non-Conformity Type',
          description: 'Problem Description',
          componentCode: 'Component Code',
          quantity: 'Quantity'
        };
        errors[field] = `${fieldNames[field]} is required`;
      }
    });

    dispatch({
      type: 'SET_VALIDATION_ERRORS',
      payload: errors
    });

    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    setShowValidation(true);
    
    if (validateCurrentStep()) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setShowValidation(false);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowValidation(false);
    }
  };

  // Handle step click (only if step is completed or current)
  const handleStepClick = (stepIndex) => {
    if (stepIndex === currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
      setShowValidation(false);
    }
  };

  // Submit form
  const handleSubmit = () => {
    // Validate all steps
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      const stepData = steps[i];
      const hasErrors = stepData.requiredFields.some(field => !currentNC[field] || currentNC[field] === '');
      if (hasErrors) {
        allValid = false;
        break;
      }
    }

    if (allValid) {
      // Save NC
      setSavedSuccessfully(true);
      setCompletedSteps([...Array(steps.length).keys()]); // Mark all steps as completed
      
      // Reset form after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'RESET_CURRENT_NC' });
        setCurrentStep(0);
        setCompletedSteps([]);
        setSavedSuccessfully(false);
        setIsDirty(false);
      }, 3000);
    } else {
      setShowValidation(true);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="nc-step-content">
            <div className="nc-form-grid">
              {/* NC Number */}
              <div className="nc-form-group">
                <label className="nc-form-label">
                  NC Number <span className="nc-auto-generated">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  className="nc-form-input nc-input-readonly"
                  value={currentNC.number}
                  readOnly
                />
              </div>

              {/* Priority */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Priority *</label>
                <select
                  className={`nc-form-select ${validationErrors.priority ? 'error' : ''}`}
                  value={currentNC.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showValidation && validationErrors.priority && (
                  <ValidationMessage message={validationErrors.priority} />
                )}
              </div>

              {/* Project */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.project ? 'error' : ''}`}
                  value={currentNC.project}
                  onChange={(e) => handleFieldChange('project', e.target.value)}
                  placeholder="e.g., JESI, SOLAR PARK A"
                />
                {showValidation && validationErrors.project && (
                  <ValidationMessage message={validationErrors.project} />
                )}
              </div>

              {/* Project Code CM */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Project Code CM *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.projectCode ? 'error' : ''}`}
                  value={currentNC.projectCode}
                  onChange={(e) => handleFieldChange('projectCode', e.target.value)}
                  placeholder="e.g., 12926"
                />
                {showValidation && validationErrors.projectCode && (
                  <ValidationMessage message={validationErrors.projectCode} />
                )}
              </div>

              {/* Date */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Date *</label>
                <input
                  type="date"
                  className={`nc-form-input ${validationErrors.date ? 'error' : ''}`}
                  value={currentNC.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
                {showValidation && validationErrors.date && (
                  <ValidationMessage message={validationErrors.date} />
                )}
              </div>

              {/* Inspector Name */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Inspector Name *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.createdBy ? 'error' : ''}`}
                  value={currentNC.createdBy}
                  onChange={(e) => handleFieldChange('createdBy', e.target.value)}
                  placeholder="e.g., Juan Sebastian Sanchez"
                />
                {showValidation && validationErrors.createdBy && (
                  <ValidationMessage message={validationErrors.createdBy} />
                )}
              </div>

              {/* Sector */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Sector *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.sector ? 'error' : ''}`}
                  value={currentNC.sector}
                  onChange={(e) => handleFieldChange('sector', e.target.value)}
                  placeholder="e.g., Quality Control, Production, Installation"
                />
                {showValidation && validationErrors.sector && (
                  <ValidationMessage message={validationErrors.sector} />
                )}
              </div>

              {/* Supplier */}
              <div className="nc-form-group">
                <label className="nc-form-label">Supplier</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.supplier}
                  onChange={(e) => handleFieldChange('supplier', e.target.value)}
                  placeholder="e.g., SCI-FAPI"
                />
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="nc-step-content">
            {/* NC Type */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Non-Conformity Type *</label>
              <select
                className={`nc-form-select ${validationErrors.ncType ? 'error' : ''}`}
                value={currentNC.ncType}
                onChange={(e) => handleFieldChange('ncType', e.target.value)}
              >
                {ncTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {showValidation && validationErrors.ncType && (
                <ValidationMessage message={validationErrors.ncType} />
              )}
            </div>

            {/* Description */}
            <div className="nc-form-group">
              <label className="nc-form-label required">Problem Description *</label>
              <textarea
                className={`nc-form-textarea-limited ${validationErrors.description ? 'error' : ''}`}
                rows="4"
                value={currentNC.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe the problem found in detail. Include specific measurements, quantities, and impact on assembly/installation..."
              />
              <div className="nc-char-count">
                {currentNC.description.length}/1000 characters
              </div>
              {showValidation && validationErrors.description && (
                <ValidationMessage message={validationErrors.description} />
              )}
            </div>

            <div className="nc-form-grid">
              {/* Purchase Order */}
              <div className="nc-form-group">
                <label className="nc-form-label">Purchase Order (Optional)</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.purchaseOrder}
                  onChange={(e) => handleFieldChange('purchaseOrder', e.target.value)}
                  placeholder="e.g., PO-2024-001"
                />
              </div>

              {/* Component Code */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Component Code *</label>
                <input
                  type="text"
                  className={`nc-form-input ${validationErrors.componentCode ? 'error' : ''}`}
                  value={currentNC.componentCode}
                  onChange={(e) => handleFieldChange('componentCode', e.target.value)}
                  placeholder="e.g., L4-155X110X50X4.5"
                />
                {showValidation && validationErrors.componentCode && (
                  <ValidationMessage message={validationErrors.componentCode} />
                )}
              </div>

              {/* Quantity */}
              <div className="nc-form-group">
                <label className="nc-form-label required">Quantity *</label>
                <input
                  type="number"
                  className={`nc-form-input ${validationErrors.quantity ? 'error' : ''}`}
                  value={currentNC.quantity}
                  onChange={(e) => handleFieldChange('quantity', e.target.value)}
                  placeholder="e.g., 232"
                  min="1"
                />
                {showValidation && validationErrors.quantity && (
                  <ValidationMessage message={validationErrors.quantity} />
                )}
              </div>

              {/* Component */}
              <div className="nc-form-group">
                <label className="nc-form-label">Component Description</label>
                <input
                  type="text"
                  className="nc-form-input"
                  value={currentNC.component}
                  onChange={(e) => handleFieldChange('component', e.target.value)}
                  placeholder="e.g., L4 LATERAL POST - 155X110X50X4.5MM, 4200MM, S420MC, HDG_100"
                />
              </div>
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="nc-step-content">
            <div className="nc-form-group">
              <label className="nc-form-label">Proposed Disposition</label>
              <select
                className="nc-form-select"
                value={currentNC.materialDisposition}
                onChange={(e) => handleFieldChange('materialDisposition', e.target.value)}
              >
                {materialDispositionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="nc-form-group">
              <label className="nc-form-label">Containment Action</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.containmentAction}
                onChange={(e) => handleFieldChange('containmentAction', e.target.value)}
                placeholder="Describe immediate actions taken to contain the defect..."
              />
            </div>
          </div>
        );

      case 'corrective':
        return (
          <div className="nc-step-content">
            <div className="nc-form-group">
              <label className="nc-form-label">Root Cause Analysis Description</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.rootCauseAnalysis}
                onChange={(e) => handleFieldChange('rootCauseAnalysis', e.target.value)}
                placeholder="Analyze and describe the root cause of this non-conformity..."
              />
            </div>

            <div className="nc-form-group">
              <label className="nc-form-label">Corrective Action Plan</label>
              <textarea
                className="nc-form-textarea-limited"
                rows="3"
                value={currentNC.correctiveActionPlan}
                onChange={(e) => handleFieldChange('correctiveActionPlan', e.target.value)}
                placeholder="Detail the corrective actions to prevent recurrence..."
              />
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="nc-step-content">
            <div className="nc-photo-upload-area">
              <div className="nc-upload-placeholder">
                <div className="nc-upload-icon">📸</div>
                <p>Click to upload photos or drag and drop</p>
                <p className="nc-upload-note">
                  Supported formats: JPG, PNG, PDF (Max 10MB each)
                </p>
              </div>
            </div>
            
            {currentNC.photos && currentNC.photos.length > 0 && (
              <div className="nc-photo-preview-grid">
                {currentNC.photos.map((photo, index) => (
                  <div key={index} className="nc-photo-preview-item">
                    <img src={photo.url} alt={`Photo ${index + 1}`} />
                    <button 
                      className="nc-photo-remove"
                      onClick={() => {
                        const newPhotos = currentNC.photos.filter((_, i) => i !== index);
                        handleFieldChange('photos', newPhotos);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="nc-create-panel-wizard">
      {/* CSS Styles */}
      <style jsx>{`
        .nc-create-panel-wizard {
          background: rgba(0, 95, 131, 0.75);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 95, 131, 0.3);
          border-radius: 16px;
          overflow: hidden;
        }

        /* Step Progress Bar Styles */
        .nc-step-progress-container {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nc-step-progress-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .nc-step-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nc-step-wrapper:hover .nc-step-circle.completed,
        .nc-step-wrapper:hover .nc-step-circle.current {
          transform: scale(1.1);
        }

        .nc-step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .nc-step-circle.pending {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .nc-step-circle.current {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          animation: pulse 2s infinite;
        }

        .nc-step-circle.completed {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }

        .nc-step-check {
          font-size: 1.3rem;
        }

        .nc-step-number {
          font-size: 1.1rem;
        }

        .nc-step-label {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          line-height: 1.2;
          max-width: 120px;
          transition: all 0.3s ease;
        }

        .nc-step-label.pending {
          color: rgba(255, 255, 255, 0.6);
        }

        .nc-step-label.current {
          color: #93c5fd;
        }

        .nc-step-label.completed {
          color: #6ee7b7;
        }

        .nc-step-connector {
          position: absolute;
          top: 25px;
          left: 50%;
          right: -50%;
          height: 3px;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .nc-step-connector.pending {
          background: rgba(255, 255, 255, 0.2);
        }

        .nc-step-connector.completed {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        /* Panel Header */
        .nc-panel-header {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .nc-panel-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .nc-panel-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          margin: 0;
        }

        .nc-step-info {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* Form Content */
        .nc-form-container {
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem;
        }

        .nc-step-content {
          min-height: 300px;
        }

        .nc-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .nc-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nc-form-label {
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .nc-form-label.required::after {
          content: ' *';
          color: #ef4444;
        }

        .nc-auto-generated {
          color: #9ca3af;
          font-weight: 400;
          font-size: 0.75rem;
        }

        .nc-form-input, .nc-form-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .nc-form-input:focus, .nc-form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .nc-form-input.error, .nc-form-select.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .nc-input-readonly {
          background-color: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .nc-form-textarea-limited {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          resize: vertical;
          font-family: inherit;
          transition: all 0.2s ease;
          grid-column: 1 / -1;
        }

        .nc-form-textarea-limited:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .nc-char-count {
          text-align: right;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .nc-validation-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .nc-validation-icon {
          font-size: 0.875rem;
        }

        /* Photo Upload */
        .nc-photo-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 3rem;
          text-align: center;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nc-photo-upload-area:hover {
          border-color: #3b82f6;
          background: #f3f4f6;
        }

        .nc-upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .nc-upload-placeholder p {
          color: #374151;
          margin: 0.5rem 0;
        }

        .nc-upload-note {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .nc-photo-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .nc-photo-preview-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .nc-photo-preview-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .nc-photo-remove {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Navigation Buttons */
        .nc-wizard-navigation {
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nc-nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .nc-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .nc-btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .nc-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .nc-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .nc-btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .nc-btn-success:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .nc-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .nc-step-counter {
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Success Message */
        .nc-success-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          margin-bottom: 0;
        }

        .nc-success-icon {
          font-size: 1.2rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .nc-step-progress-container {
            padding: 1rem;
          }

          .nc-step-circle {
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }

          .nc-step-label {
            font-size: 0.75rem;
            max-width: 80px;
          }

          .nc-form-container {
            padding: 1.5rem;
          }

          .nc-form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .nc-panel-header {
            padding: 1.5rem;
          }

          .nc-panel-title {
            font-size: 1.25rem;
          }

          .nc-wizard-navigation {
            padding: 1rem 1.5rem;
          }

          .nc-nav-buttons {
            flex-direction: column;
            width: 100%;
          }

          .nc-btn {
            justify-content: center;
          }
        }
      `}</style>

      {/* Success Message */}
      {savedSuccessfully && (
        <div className="nc-success-banner">
          <span className="nc-success-icon">✅</span>
          <span>Non-Conformity {currentNC.number} has been created successfully!</span>
        </div>
      )}

      {/* Step Progress Bar */}
      <StepProgressBar 
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Panel Header */}
      <div className="nc-panel-header">
        <h3 className="nc-panel-title">
          <span className="nc-panel-icon">{steps[currentStep].id === 'basic' ? '➕' : 
            steps[currentStep].id === 'details' ? '🔍' :
            steps[currentStep].id === 'treatment' ? '⚙️' :
            steps[currentStep].id === 'corrective' ? '🔧' : '📸'}</span>
          {steps[currentStep].title}
        </h3>
        <p className="nc-panel-subtitle">
          {steps[currentStep].subtitle}
        </p>
        <div className="nc-step-info">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Form Content */}
      <div className="nc-form-container">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="nc-wizard-navigation">
        <div className="nc-step-counter">
          Step {currentStep + 1} of {steps.length}
        </div>
        
        <div className="nc-nav-buttons">
          <button 
            className="nc-btn nc-btn-secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            ← Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button 
              className="nc-btn nc-btn-primary"
              onClick={handleNext}
            >
              Next →
            </button>
          ) : (
            <button 
              className="nc-btn nc-btn-success"
              onClick={handleSubmit}
            >
              ✓ Submit NC
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNCPanel;