// src/components/layout/ContentHeader.jsx
import React from 'react';
import { Search } from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector';

const ContentHeader = ({ title }) => {
  return (
    <div 
      className="content-header" 
      style={{ 
        color: 'white', 
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
      }}
    >
      <h1 
        className="page-title" 
        style={{ 
          color: 'white', 
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
        }}
      >
        {title}
      </h1>
      
      <div className="flex items-center gap-4">
        <LanguageSelector />
      </div>
    </div>
  );
};

export default ContentHeader;