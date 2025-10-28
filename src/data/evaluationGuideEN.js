export const evaluationGuideEN = {
  title: "SUPPLIER EVALUATION GUIDE",
  subtitle: "Objective Scoring Criteria Matrix",
  
  instructions: {
    title: "GENERAL INSTRUCTIONS",
    content: "This guide provides specific criteria to evaluate suppliers on each KPI. The inspector must review each criterion and assign the score that best reflects the current situation of the supplier.",
    
    scoringScale: {
      title: "SCORING SCALE",
      levels: [
        { score: 1, label: "Not Acceptable/Reject", description: "Critical deficiencies that prevent adequate operation" },
        { score: 2, label: "Improvement/Update Required", description: "Partial compliance, requires corrective actions" },
        { score: 3, label: "Acceptable", description: "Meets minimum expected requirements" },
        { score: 4, label: "Excellent (Benchmark)", description: "Exceeds expectations, role model" }
      ]
    }
  },
  
  kpis: [
    {
      id: "kpi1",
      title: "KPI1 - PRODUCTION CAPACITY & EQUIPMENT",
      levels: [
        {
          score: 1,
          label: "NOT ACCEPTABLE/REJECT",
          criteria: [
            "Insufficient production capacity to meet required volumes (< 50% of needed)",
            "Obsolete or poor condition equipment (more than 30% out of service)",
            "No preventive maintenance plan exists",
            "Inadequate or unsafe facilities",
            "No backup for critical equipment",
            "Technology incompatible with required technical specifications"
          ]
        },
        {
          score: 2,
          label: "IMPROVEMENT/UPDATE REQUIRED",
          criteria: [
            "Fair production capacity (50-80% of required) with frequent limitations",
            "Functional but outdated equipment (5-10 years without update)",
            "Reactive maintenance without formal program",
            "Some critical machines without backup",
            "Basic facilities requiring improvements",
            "Occasional capacity problems in high season"
          ]
        },
        {
          score: 3,
          label: "ACCEPTABLE",
          criteria: [
            "Adequate production capacity (80-100% of required)",
            "Equipment in good condition and functional",
            "Established and documented preventive maintenance program",
            "Backup for critical equipment",
            "Appropriate and organized facilities",
            "Current technology (less than 5 years)",
            "Can meet seasonal demand peaks"
          ]
        },
        {
          score: 4,
          label: "EXCELLENT (BENCHMARK)",
          criteria: [
            "Superior production capacity (>120% of required)",
            "State-of-the-art and highly efficient equipment",
            "Predictive maintenance system implemented (TPM, Industry 4.0)",
            "Complete redundancy in critical lines",
            "Modern facilities with certifications (ISO, etc.)",
            "Continuous investment in technological innovation",
            "Flexibility for rapid production changes",
            "Advanced automation and digitalization"
          ]
        }
      ]
    },
    {
      id: "kpi2",
      title: "KPI2 - QUALITY CONTROL SYSTEM",
      levels: [
        {
          score: 1,
          label: "NOT ACCEPTABLE/REJECT",
          criteria: [
            "No documented quality control system",
            "No dedicated quality personnel",
            "No measurement or calibration equipment",
            "Defect rate >5% in deliveries",
            "No product traceability",
            "No non-conformity procedure exists",
            "No inspection records"
          ]
        },
        {
          score: 2,
          label: "IMPROVEMENT/UPDATE REQUIRED",
          criteria: [
            "Basic quality system without certification",
            "Limited quality staff or without formal training",
            "Outdated or uncalibrated measurement equipment",
            "Defect rate between 2-5%",
            "Inspection mainly at final product",
            "Non-standardized quality procedures",
            "Slow response to non-conformities"
          ]
        },
        {
          score: 3,
          label: "ACCEPTABLE",
          criteria: [
            "Certified quality management system (ISO 9001 or equivalent)",
            "Trained and dedicated quality team",
            "Calibrated and updated measurement equipment",
            "Defect rate <2%",
            "Inspection at critical process points",
            "Documented and followed procedures",
            "Complete batch traceability",
            "Regular internal audits"
          ]
        },
        {
          score: 4,
          label: "EXCELLENT (BENCHMARK)",
          criteria: [
            "Multiple certifications (ISO 9001, IATF 16949, according to industry)",
            "Quality system integrated with production (SPC, Lean Six Sigma)",
            "In-house laboratory with accreditation",
            "Defect rate <0.5%",
            "Statistical process control implemented",
            "Preventive quality culture (Poka-Yoke, FMEA)",
            "Active continuous improvement system with KPIs",
            "Innovation in quality methods"
          ]
        }
      ]
    },
    {
      id: "kpi3",
      title: "KPI3 - RAW MATERIALS MANAGEMENT & TRACEABILITY",
      levels: [
        {
          score: 1,
          label: "NOT ACCEPTABLE/REJECT",
          criteria: [
            "No raw material inventory control",
            "No verification of incoming materials",
            "No traceability system",
            "Inadequate or unsafe storage",
            "Frequent shortage of critical materials",
            "No FIFO/FEFO method"
          ]
        },
        {
          score: 2,
          label: "IMPROVEMENT/UPDATE REQUIRED",
          criteria: [
            "Manual or basic inventory control",
            "Irregular inspection of incoming materials",
            "Partial traceability (only large batches)",
            "Basic storage without controlled conditions",
            "Insufficient safety stock",
            "FIFO applied inconsistently"
          ]
        },
        {
          score: 3,
          label: "ACCEPTABLE",
          criteria: [
            "Computerized inventory system",
            "Documented receiving inspection",
            "Complete traceability from batch to final product",
            "Adequate storage with controlled conditions",
            "Optimal stock levels (ABC analysis)",
            "FIFO/FEFO consistently implemented",
            "Clear material identification"
          ]
        },
        {
          score: 4,
          label: "EXCELLENT (BENCHMARK)",
          criteria: [
            "WMS system integrated with ERP",
            "Automated inspection with advanced technology",
            "Real-time digital traceability (blockchain, RFID)",
            "Certified warehouses with continuous environmental monitoring",
            "Optimized materials planning (MRP II)",
            "Lean inventory management (JIT, Kanban)",
            "Material certifications (sustainability)",
            "Predictive demand analysis"
          ]
        }
      ]
    },
    {
      id: "kpi4",
      title: "KPI4 - HUMAN RESOURCES & COMPETENCIES",
      levels: [
        {
          score: 1,
          label: "NOT ACCEPTABLE/REJECT",
          criteria: [
            "High staff turnover (>30% annually)",
            "No training programs",
            "Staff without required certifications",
            "Undefined or chaotic organization chart",
            "Poor working conditions",
            "Non-compliance with labor regulations"
          ]
        },
        {
          score: 2,
          label: "IMPROVEMENT/UPDATE REQUIRED",
          criteria: [
            "Moderate-high turnover (15-30% annually)",
            "Sporadic and unstructured training",
            "Expired or in-process certifications",
            "Basic but functional organization chart",
            "Irregular performance evaluations",
            "Dependence on key personnel without planned succession"
          ]
        },
        {
          score: 3,
          label: "ACCEPTABLE",
          criteria: [
            "Controlled turnover (<15% annually)",
            "Documented annual training plan",
            "Certified staff according to requirements",
            "Clear organization chart with defined authority lines",
            "Formal annual performance evaluations",
            "Adequate and safe working conditions",
            "Succession plan for critical positions",
            "Documented competency matrix"
          ]
        },
        {
          score: 4,
          label: "EXCELLENT (BENCHMARK)",
          criteria: [
            "Low turnover (<5% annually) and high staff commitment",
            "Comprehensive talent development program",
            "International staff certifications",
            "Optimized organizational structure",
            "360° evaluation and competency management",
            "Wellness and engagement programs",
            "Defined career path",
            "Multifunctional and polyvalent teams",
            "Innovation and continuous improvement culture"
          ]
        }
      ]
    },
    {
      id: "kpi5",
      title: "KPI5 - LOGISTICS PLANNING & DELIVERIES",
      levels: [
        {
          score: 1,
          label: "NOT ACCEPTABLE/REJECT",
          criteria: [
            "Late deliveries >20% of the time",
            "No delivery planning system",
            "No order tracking",
            "Inadequate packaging causing frequent damage",
            "No backup transport options",
            "Lack of communication about delays",
            "Incorrect or missing documentation"
          ]
        },
        {
          score: 2,
          label: "IMPROVEMENT/UPDATE REQUIRED",
          criteria: [
            "Late deliveries 10-20% of the time",
            "Basic planning without formal tools",
            "Manual and reactive tracking",
            "Standard packaging but occasional damage",
            "Dependence on a single carrier",
            "Irregular communication about order status",
            "Variable quantity compliance"
          ]
        },
        {
          score: 3,
          label: "ACCEPTABLE",
          criteria: [
            "On-time delivery >90% (OTD >90%)",
            "Documented planning system",
            "Order tracking in computerized system",
            "Adequate packaging according to specifications",
            "Multiple transport options",
            "Proactive communication of any deviation",
            "Exact quantity compliance",
            "Complete and correct documentation",
            "Flexibility for urgent changes"
          ]
        },
        {
          score: 4,
          label: "EXCELLENT (BENCHMARK)",
          criteria: [
            "On-time delivery >98% (OTD >98%)",
            "Integrated planning system (ERP, TMS)",
            "Real-time tracking with customer visibility",
            "Optimized and sustainable packaging",
            "Robust logistics network with multiple options",
            "Customer portal for order management",
            "Perfect compliance with JIT deliveries",
            "Digital and automated documentation (EDI)",
            "Logistics certifications (C-TPAT, AEO)",
            "Continuous improvement program in logistics"
          ]
        }
      ]
    }
  ],
  
  methodology: {
    title: "EVALUATION METHODOLOGY",
    steps: [
      {
        title: "1. PREPARATION",
        items: [
          "Review this guide before the audit",
          "Prepare checklist with specific criteria",
          "Review supplier history if it exists"
        ]
      },
      {
        title: "2. DURING THE AUDIT",
        items: [
          "Mark met/not met criteria",
          "Request objective evidence (documents, records, direct observation)",
          "Take photographs when relevant",
          "Interview key personnel"
        ]
      },
      {
        title: "3. SCORE ASSIGNMENT",
        items: [
          "Count how many criteria the supplier meets at each level",
          "If meets >80% of a level's criteria, that score can be assigned",
          "In case of doubt between two levels, assign the lower level",
          "If critical criteria are not met, cannot obtain higher score"
        ]
      },
      {
        title: "4. DOCUMENTATION",
        items: [
          "Justify the assigned score with specific evidence",
          "Document findings and improvement opportunities",
          "Establish action plan for scores 1 and 2"
        ]
      },
      {
        title: "5. FOLLOW-UP",
        items: [
          "For score 1: Immediate action plan or supplier change",
          "For score 2: Improvement plan with defined timeline (3-6 months)",
          "For score 3: Continuous improvement and maintenance",
          "For score 4: Share best practices, strategic supplier"
        ]
      }
    ]
  },
  
  decisionMatrix: {
    title: "QUICK DECISION MATRIX",
    critical: {
      title: "CRITICAL CRITERIA",
      subtitle: "If one fails, maximum score is 1:",
      items: [
        "Non-compliance with legal regulations",
        "Safety risk for personnel or product",
        "Inability to meet critical technical specifications",
        "Lack of traceability in regulated industries"
      ]
    },
    benchmark: {
      title: "BENCHMARK CRITERIA (SCORE 4)",
      items: [
        "Current international certifications",
        "Cutting-edge technology",
        "Superior performance in key metrics (>95%)",
        "Demonstrable innovation",
        "Industry recognition"
      ]
    }
  },
  
  globalScore: {
    title: "SUPPLIER GLOBAL SCORE",
    subtitle: "Average of the 5 KPIs:",
    ranges: [
      { range: "1.0 - 1.9", class: "CRITICAL", description: "Not acceptable, seek alternatives", color: "#ef4444" },
      { range: "2.0 - 2.9", class: "REQUIRES IMPROVEMENT", description: "Developing supplier with action plan", color: "#f59e0b" },
      { range: "3.0 - 3.5", class: "ACCEPTABLE", description: "Reliable supplier for regular operation", color: "#10b981" },
      { range: "3.6 - 4.0", class: "STRATEGIC", description: "World-class supplier, long-term partner", color: "#3b82f6" }
    ]
  },
  
  additionalNotes: {
    title: "ADDITIONAL NOTES",
    items: [
      "This guide should be reviewed and updated annually",
      "Specific criteria can be added according to industry",
      "Scores must be consistent among evaluators",
      "It is recommended that two evaluators audit independently and compare results",
      "Maintain historical record of evaluations to see supplier evolution"
    ]
  }
};