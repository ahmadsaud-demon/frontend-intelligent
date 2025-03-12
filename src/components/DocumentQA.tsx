import React, { useState, useEffect } from 'react';
import { Send, Loader2, BookOpen, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchQAHistory, askQuestion } from '../lib/api';

interface DocumentQAProps {
  materialId: string;
}

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

export default function DocumentQA({ materialId }: DocumentQAProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQAHistory] = useState<QAEntry[]>([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    loadQAHistory();
  }, [materialId]);

  async function loadQAHistory() {
    try {
      setLoading(true);
      const history = await fetchQAHistory(materialId);
      setQAHistory(history);
    } catch (error) {
      console.error('Error fetching QA history:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setAsking(true);
      const { answer } = await askQuestion(materialId, question.trim());
      await loadQAHistory();
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setAsking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
          Document Q&A
        </h3>
      </div>

      <div className="p-4">
        <form onSubmit={handleAskQuestion} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this document..."
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={asking}
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {asking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {qaHistory.map((entry) => (
            <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.user.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{entry.question}</p>
                  <div className="mt-2 prose prose-sm max-w-none">
                    <ReactMarkdown>{entry.answer}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {qaHistory.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              No questions asked yet. Be the first to ask a question!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}