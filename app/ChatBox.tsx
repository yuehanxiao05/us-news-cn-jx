"use client";

import { useState } from "react";

export default function ChatBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/search-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    setAnswer(data.answer || "没有找到答案。");
    setLoading(false);
  }

  return (
    <div
      style={{
        marginBottom: 40,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "#fafafa",
      }}
    >
      <h2>问我任何问题</h2>
      <p style={{ color: "#666" }}>
        例如：什么是 BuzzFeed？Tesla 最近发生了什么？
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="输入你的问题..."
        rows={3}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
        }}
      />

      <button
        onClick={askQuestion}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: "#111",
          color: "white",
          cursor: "pointer",
        }}
      >
        {loading ? "搜索中..." : "提问"}
      </button>

      {answer && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "white",
            borderRadius: 8,
            lineHeight: 1.7,
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}