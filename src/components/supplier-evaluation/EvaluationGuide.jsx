import React, { useState } from 'react';
import styles from '../../styles/EvaluationGuide.module.css';
import { evaluationGuideEN } from '../../data/evaluationGuideEN';
import { evaluationGuideIT } from '../../data/evaluationGuideIT';

const EvaluationGuide = () => {
  const [language, setLanguage] = useState('en');
  const [expandedKPIs, setExpandedKPIs] = useState({});
  
  const guide = language === 'en' ? evaluationGuideEN : evaluationGuideIT;
  
  const toggleKPI = (kpiId) => {
    setExpandedKPIs(prev => ({
      ...prev,
      [kpiId]: !prev[kpiId]
    }));
  };
  
  const toggleAllKPIs = (expand) => {
    const newState = {};
    guide.kpis.forEach(kpi => {
      newState[kpi.id] = expand;
    });
    setExpandedKPIs(newState);
  };

  return (
    <div className={styles.guideContainer}>
      {/* Header with Language Selector */}
      <div className={styles.guideHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.guideTitle}>{guide.title}</h1>
          <p className={styles.guideSubtitle}>{guide.subtitle}</p>
        </div>
        
        <div className={styles.languageSelector}>
          <button
            className={`${styles.langButton} ${language === 'en' ? styles.active : ''}`}
            onClick={() => setLanguage('en')}
          >
            🇬🇧 English
          </button>
          <button
            className={`${styles.langButton} ${language === 'it' ? styles.active : ''}`}
            onClick={() => setLanguage('it')}
          >
            🇮🇹 Italiano
          </button>
        </div>
      </div>

      {/* Instructions Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{guide.instructions.title}</h2>
        <p className={styles.instructionText}>{guide.instructions.content}</p>
        
        <div className={styles.scoringScale}>
          <h3 className={styles.subsectionTitle}>{guide.instructions.scoringScale.title}</h3>
          <div className={styles.scaleGrid}>
            {guide.instructions.scoringScale.levels.map((level) => (
              <div key={level.score} className={styles.scaleCard}>
                <div className={styles.scoreNumber}>{level.score}</div>
                <div className={styles.scoreContent}>
                  <div className={styles.scoreLabel}>{level.label}</div>
                  <div className={styles.scoreDescription}>{level.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className={styles.quickControls}>
        <button 
          className={styles.controlButton}
          onClick={() => toggleAllKPIs(true)}
        >
          ➕ Expand All KPIs
        </button>
        <button 
          className={styles.controlButton}
          onClick={() => toggleAllKPIs(false)}
        >
          ➖ Collapse All KPIs
        </button>
      </div>

      {/* KPIs Section */}
      <div className={styles.kpisContainer}>
        {guide.kpis.map((kpi) => (
          <div key={kpi.id} className={styles.kpiSection}>
            <div 
              className={styles.kpiHeader}
              onClick={() => toggleKPI(kpi.id)}
            >
              <h2 className={styles.kpiTitle}>{kpi.title}</h2>
              <button className={styles.expandIcon}>
                {expandedKPIs[kpi.id] ? '▼' : '▶'}
              </button>
            </div>
            
            {expandedKPIs[kpi.id] && (
              <div className={styles.kpiContent}>
                {kpi.levels.map((level) => (
                  <div key={level.score} className={styles.levelCard}>
                    <div className={styles.levelHeader}>
                      <span className={styles.levelScore}>Score {level.score}</span>
                      <span className={styles.levelLabel}>{level.label}</span>
                    </div>
                    <ul className={styles.criteriaList}>
                      {level.criteria.map((criterion, index) => (
                        <li key={index} className={styles.criterionItem}>
                          <span className={styles.checkBox}>☐</span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Methodology Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{guide.methodology.title}</h2>
        <div className={styles.methodologyGrid}>
          {guide.methodology.steps.map((step, index) => (
            <div key={index} className={styles.methodologyCard}>
              <h3 className={styles.methodologyTitle}>{step.title}</h3>
              <ul className={styles.methodologyList}>
                {step.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Matrix Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{guide.decisionMatrix.title}</h2>
        
        <div className={styles.decisionGrid}>
          <div className={styles.decisionCard} style={{ borderLeft: '4px solid #ef4444' }}>
            <h3 className={styles.decisionTitle}>{guide.decisionMatrix.critical.title}</h3>
            <p className={styles.decisionSubtitle}>{guide.decisionMatrix.critical.subtitle}</p>
            <ul className={styles.decisionList}>
              {guide.decisionMatrix.critical.items.map((item, index) => (
                <li key={index}>
                  <span className={styles.checkBox}>☐</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.decisionCard} style={{ borderLeft: '4px solid #3b82f6' }}>
            <h3 className={styles.decisionTitle}>{guide.decisionMatrix.benchmark.title}</h3>
            <ul className={styles.decisionList}>
              {guide.decisionMatrix.benchmark.items.map((item, index) => (
                <li key={index}>
                  <span className={styles.checkBox}>☐</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Global Score Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{guide.globalScore.title}</h2>
        <p className={styles.globalScoreSubtitle}>{guide.globalScore.subtitle}</p>
        
        <div className={styles.scoreRangesTable}>
          {guide.globalScore.ranges.map((range, index) => (
            <div 
              key={index} 
              className={styles.scoreRangeRow}
              style={{ borderLeft: `5px solid ${range.color}` }}
            >
              <div className={styles.rangeValue}>{range.range}</div>
              <div className={styles.rangeContent}>
                <div className={styles.rangeClass} style={{ color: range.color }}>
                  {range.class}
                </div>
                <div className={styles.rangeDescription}>{range.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{guide.additionalNotes.title}</h2>
        <ul className={styles.notesList}>
          {guide.additionalNotes.items.map((note, index) => (
            <li key={index} className={styles.noteItem}>
              <span className={styles.bulletPoint}>•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className={styles.guideFooter}>
        <div className={styles.footerDivider}></div>
        <p className={styles.footerText}>
          {language === 'en' 
            ? 'Created: October 2025 | Review: Annual | Approved by: Quality / Purchasing Management'
            : 'Creato: Ottobre 2025 | Revisione: Annuale | Approvato da: Direzione Qualità / Acquisti'}
        </p>
      </div>
    </div>
  );
};

export default EvaluationGuide;