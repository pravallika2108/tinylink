'use client';

import { useState, useEffect } from 'react';

interface Link {
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ url: '', code: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching links:', error);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      new URL(formData.url);
    } catch {
      setFormError('Please enter a valid URL');
      setFormLoading(false);
      return;
    }

    if (formData.code && !/^[A-Za-z0-9]{6,8}$/.test(formData.code)) {
      setFormError('Code must be 6-8 alphanumeric characters');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 409) {
        setFormError('This code is already taken. Please choose another.');
        setFormLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Failed to create link');

      const newLink = await res.json();
      setLinks([newLink, ...links]);
      setFormData({ url: '', code: '' });
      setShowAddForm(false);
      setSuccessMessage('Link created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setFormError('Failed to create link. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setLinks(links.filter(link => link.code !== code));
    } catch (error) {
      alert('Failed to delete link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredLinks = links.filter(link =>
    link.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.target_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TinyLink</h1>
          <p className="text-gray-600">Shorten URLs and track clicks</p>
        </header>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="text-xl">+</span>
              Add Link
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL *
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/your-long-url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Code (optional, 6-8 characters)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="docs123"
                  pattern="[A-Za-z0-9]{6,8}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">Leave empty for auto-generated code</p>
              </div>
              {formError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={formLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Creating...' : 'Create Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError('');
                    setFormData({ url: '', code: '' });
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by code or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading links...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No links found matching your search.' : 'No links yet. Create your first one!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Short Code</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Target URL</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Clicks</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Clicked</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLinks.map((link) => (
                    <tr key={link.code} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-mono text-sm">
                            {link.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${window.location.origin}/${link.code}`)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors text-lg"
                            title="Copy link"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 max-w-md">
                          <span className="truncate text-sm text-gray-700" title={link.target_url}>
                            {link.target_url}
                          </span>
                          <a
                            href={link.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0 text-lg"
                          >
                            🔗
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{link.clicks}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <a
                            href={`/code/${link.code}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Stats
                          </a>
                          <button
                            onClick={() => handleDelete(link.code)}
                            className="text-red-600 hover:text-red-800 transition-colors text-lg"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      
      </div>
    </div>
  );
}