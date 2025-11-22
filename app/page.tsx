"use client";

import { useEffect, useState } from "react";

type Link = {
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch all links
  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
    setFilteredLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Add new link
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code: code || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    setUrl("");
    setCode("");
    fetchLinks();
    setSubmitting(false);
  };

  // Delete link
  const handleDelete = async (code: string) => {
    if (!confirm(`Delete link ${code}?`)) return;
    await fetch(`/api/links/${code}`, { method: "DELETE" });
    fetchLinks();
  };

  // Search/filter links
  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredLinks(
      links.filter(
        (link) =>
          link.code.toLowerCase().includes(lower) ||
          link.url.toLowerCase().includes(lower)
      )
    );
  }, [search, links]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">TinyLink Dashboard</h1>

      {/* Add Link Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="p-2 border rounded flex-1"
        />
        <input
          type="text"
          placeholder="Custom Code (optional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="p-2 border rounded w-48"
        />
        <button
          type="submit"
          disabled={submitting}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Link"}
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by code or URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full md:w-96"
        />
      </div>

      {/* Links Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b text-left">Code</th>
              <th className="p-2 border-b text-left">URL</th>
              <th className="p-2 border-b text-left">Clicks</th>
              <th className="p-2 border-b text-left">Last Clicked</th>
              <th className="p-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No links found
                </td>
              </tr>
            )}
            {filteredLinks.map((link) => (
              <tr key={link.code} className="hover:bg-gray-50">
                <td className="p-2 border-b">{link.code}</td>
                <td className="p-2 border-b truncate max-w-xs" title={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.url}
                  </a>
                </td>
                <td className="p-2 border-b">{link.clicks}</td>
                <td className="p-2 border-b">
                  {link.last_clicked
                    ? new Date(link.last_clicked).toLocaleString()
                    : "-"}
                </td>
                <td className="p-2 border-b flex gap-2">
                  <button
                    onClick={() => handleDelete(link.code)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(`${window.location.origin}/${link.code}`)
                    }
                    className="text-green-500 hover:underline"
                  >
                    Copy Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
