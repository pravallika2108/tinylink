"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Link = {
  code: string;
  url: string;
  clicks: number;
  last_clicked_at: string | null;
  created_at: string;
};

export default function StatsPage() {
  const params = useParams();
  const code = params.code;
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/links/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("Link not found");
        return res.json();
      })
      .then((data) => setLink(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!link) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Stats for {link.code}</h1>
      <p>
        <strong>Original URL:</strong>{" "}
        <a href={link.url} target="_blank" className="text-blue-500">
          {link.url}
        </a>
      </p>
      <p>
        <strong>Total Clicks:</strong> {link.clicks}
      </p>
      <p>
        <strong>Last Clicked:</strong> {link.last_clicked_at || "-"}
      </p>
      <p>
        <strong>Created At:</strong> {link.created_at}
      </p>
    </div>
  );
}
