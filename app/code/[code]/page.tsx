'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

interface LinkData {
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default function StatsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkStats();
  }, [code]);

  const fetchLinkStats = async () => {
    try {
      const res = await fetch(`/api/links/${code}`);
      if (res.status === 404) {
        setError('Link not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLink(data);
    } catch (err) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Link Not Found</h1>
          <Link href="/" className="text-indigo-600 hover:underline">Go back to dashboard</Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${window.location.origin}/${link.code}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6">
          <span className="text-xl">←</span>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Link Statistics</h1>

          <div className="space-y-6">
            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Short Code</label>
              <div className="flex items-center gap-3">
                <code className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-mono text-lg">
                  {link.code}
                </code>
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors text-xl"
                  title="Copy short URL"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">{shortUrl}</p>
            </div>

            <div className="border-b pb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Target URL</label>
              <div className="flex items-center gap-3">
                <a
                  href={link.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline break-all"
                >
                  {link.target_url}
                </a>
                <span className="text-gray-400 flex-shrink-0 text-xl">🔗</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Clicks</p>
                <p className="text-4xl font-bold text-blue-700">{link.clicks}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Last Clicked</p>
                <p className="text-lg font-semibold text-purple-700">
                  {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : 'Never'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Created</p>
                <p className="text-lg font-semibold text-green-700">
                  {new Date(link.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`/${link.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Test Redirect
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}