'use client';

import React, { useState } from 'react';
import SymptomChecker from '@/components/ai/SymptomChecker';

// Placeholder components for future AI modules
const AskClinicWidget = () => (
  <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 text-center text-gray-500">
    Ask Clinic (RAG) Widget Coming Soon
  </div>
);

const SuggestedDoctors = () => (
  <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 text-center text-gray-500">
    Doctor Recommender Coming Soon
  </div>
);

const IDScanner = () => (
  <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 text-center text-gray-500">
    ID Scanner (Vision) Coming Soon
  </div>
);

const VoiceInput = () => (
  <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 text-center text-gray-500">
    Voice Input Coming Soon
  </div>
);

export default function AILabPage() {
  const [activeTab, setActiveTab] = useState('symptom-checker');

  const tabs = [
    { id: 'symptom-checker', label: 'Symptom Checker', component: <SymptomChecker /> },
    { id: 'ask-clinic', label: 'Ask Clinic (RAG)', component: <AskClinicWidget /> },
    { id: 'doctors', label: 'Doctor Recommender', component: <SuggestedDoctors /> },
    { id: 'vision', label: 'ID Scanner (Vision)', component: <IDScanner /> },
    { id: 'voice', label: 'Voice Input', component: <VoiceInput /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Lab 🧪</h1>
        <p className="text-gray-600">
          Experimental playground for testing independent AI modules before integration.
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <div className="bg-white rounded-lg">
              {tabs.find((t) => t.id === activeTab)?.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
