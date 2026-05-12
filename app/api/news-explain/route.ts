import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, summary, mode } = await req.json();

    if (!title || !mode) {
      return NextResponse.json(
        { answer: "缺少新闻标题或解释模式。" },
        { status: 400 }
      );
    }

    const prompt =
      mode === "eli5"
        ? `
请用“Explain Like I'm 5”的方式，用中文解释这条新闻。
要求：
1. 用很简单的比喻和语言。
2. 人名、公司名、产品名保留英文。
3. 控制在 3-5 句话。
4. 不要添加原文没有的信息。

新闻标题：
${title}

新闻概括：
${summary || ""}
`
        : `
请用中文解释这条新闻为什么重要。
要求：
1. 说明它可能影响谁。
2. 说明它为什么值得关注。
3. 人名、公司名、产品名保留英文。
4. 控制在 3-5 句话。
5. 不要添加原文没有的信息。

新闻标题：
${title}

新闻概括：
${summary || ""}
`;

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({
        answer: `解释失败：${data.error.message}`,
      });
    }

    const answer =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "没有生成解释。";

    return NextResponse.json({ answer });
  } catch (error) {
    console.log("Explain failed:", error);

    return NextResponse.json(
      { answer: "服务器出错了，请稍后再试。" },
      { status: 500 }
    );
  }
}