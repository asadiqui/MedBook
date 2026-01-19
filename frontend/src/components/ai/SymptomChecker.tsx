'use client'; // this part needs to run in the user's browser, not on the server

import React, { useState } from 'react';
import { api } from '../../lib/api';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');
    
    try {
      const { data } = await api.post('/ai/llm/symptom-checker', { symptoms });
      setSummary(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Symptom Checker</h2>
          <p className="text-sm text-gray-500">Describe your symptoms for a preliminary analysis</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling?
          </label>
          <textarea
            id="symptoms"
            className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-gray-700 placeholder-gray-400"
            rows={5}
            placeholder="E.g., I have had a persistent headache for 2 days, accompanied by light sensitivity..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              loading 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow active:scale-95'
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {summary && (
        <div className="mt-8 relative animate-fade-in">
          <div className="absolute -left-3 top-6 bottom-6 w-1 bg-blue-100 rounded-full"></div>
          <div className="pl-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Doctor's Brief
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
            <p className="mt-3 text-xs text-gray-400 italic">
              * This is an AI-generated summary and not a medical diagnosis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
