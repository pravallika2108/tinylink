"use client";

import { useState, useEffect } from "react";

type Link = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  last_clicked_at: string | null;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all links
  useEffect(() => {
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch(console.error);
  }, []);

  const addLink = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code: code || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add link");
      } else {
        setLinks([data, ...links]);
        setUrl("");
        setCode("");
      }
    } catch (e) {
      setError("Error adding link");
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (code: string) => {
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter((l) => l.code !== code));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">TinyLink Dashboard</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Optional Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={addLink}
          disabled={loading}
          className="bg-blue-500 text-white p-2"
        >
          {loading ? "Adding..." : "Add Link"}
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Code</th>
            <th className="text-left p-2">URL</th>
            <th className="text-left p-2">Clicks</th>
            <th className="text-left p-2">Last Clicked</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} className="border-b">
              <td className="p-2">{link.code}</td>
              <td className="p-2 truncate max-w-xs">{link.url}</td>
              <td className="p-2">{link.clicks}</td>
              <td className="p-2">{link.last_clicked_at || "-"}</td>
              <td className="p-2">
                <button
                  onClick={() => deleteLink(link.code)}
                  className="bg-red-500 text-white p-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
