"use client";

import { useState } from "react";

type NewsCardProps = {
  index: number;
  title: string;
  summary?: string;
  link: string;
};

export default function NewsCard({
  index,
  title,
  summary,
  link,
}: NewsCardProps) {
  const [answer, setAnswer] = useState("");
  const [loadingMode, setLoadingMode] = useState<"" | "eli5" | "why">("");

  async function explain(mode: "eli5" | "why") {
    setLoadingMode(mode);
    setAnswer("");

    const res = await fetch("/api/news-explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        summary,
        mode,
      }),
    });

    const data = await res.json();

    setAnswer(data.answer || "没有生成解释。");
    setLoadingMode("");
  }

  return (
    <article
      style={{
        marginBottom: 24,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 12,
      }}
    >
      <h3>
        {index + 1}. {title}
      </h3>

      <p style={{ lineHeight: 1.7, color: "#333" }}>
        {summary || "暂无概括"}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => explain("eli5")}
          disabled={!!loadingMode}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {loadingMode === "eli5" ? "解释中..." : "💡 Explain Like I'm 5"}
        </button>

        <button
          onClick={() => explain("why")}
          disabled={!!loadingMode}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {loadingMode === "why" ? "分析中..." : "📈 Why does this matter?"}
        </button>

        <a href={link} target="_blank">
          阅读原文
        </a>
      </div>

      {answer && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "#f7f7f7",
            borderRadius: 8,
            lineHeight: 1.7,
          }}
        >
          {answer}
        </div>
      )}
    </article>
  );
}