import React from 'react';
import { BarcodeAI } from '../components/ai/BarcodeAI';

export const AITestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          VALEO NeuroERP - AI Integration Test
        </h1>
        <BarcodeAI />
      </div>
    </div>
  );
}; 