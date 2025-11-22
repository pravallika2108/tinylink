"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Link = {
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
};

export default function LinkStats() {
  const params = useParams();
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLink() {
      try {
        const res = await fetch(`/api/links/${params.code}`);
        if (!res.ok) {
          setError("Link not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setLink(data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching link");
        setLoading(false);
      }
    }
    fetchLink();
  }, [params.code]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!link) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Link Stats</h1>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <strong>Code:</strong> {link.code}
        </div>
        <div>
          <strong>Original URL:</strong>{" "}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {link.url}
          </a>
        </div>
        <div>
          <strong>Total Clicks:</strong> {link.clicks}
        </div>
        <div>
          <strong>Last Clicked:</strong>{" "}
          {link.last_clicked
            ? new Date(link.last_clicked).toLocaleString()
            : "-"}
        </div>
        <div>
          <strong>Created At:</strong>{" "}
          {new Date(link.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
