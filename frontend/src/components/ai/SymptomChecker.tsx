'use client'; // this part needs to run in the user's browser, not on the server

import React, { useState } from 'react';

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
      // Backend is running on port 4000
      const response = await fetch('http://localhost:4000/ai/llm/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch summary');
      }

      const data = await response.text();
      setSummary(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Symptom Checker</h2>
      <p className="mb-4 text-gray-600">
        Describe your symptoms below, and our AI will generate a summary for your doctor.
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={5}
          placeholder="E.g., I have a headache, a sore throat, and I feel tired..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
        />
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${
            loading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Check Symptoms'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Summary for Doctor:</h3>
          <div className="prose text-gray-700 whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
