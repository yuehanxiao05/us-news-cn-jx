import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { answer: "请输入问题。" },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        tools: [{ type: "web_search_preview" }],
        input: `
请用中文回答用户的问题。

要求：
1. 可以联网搜索公开网页
2. 人名、公司名、产品名保留英文
3. 回答清楚简洁
4. 如果找不到答案，请明确说明

用户问题：
${question}
        `,
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.log("OpenAI error:", data.error);

      return NextResponse.json({
        answer: `搜索失败：${data.error.message}`,
      });
    }

    let answer = data.output_text || "";

    if (!answer && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content.type === "output_text" && content.text) {
              answer = content.text;
              break;
            }
          }
        }

        if (answer) break;
      }
    }

    if (!answer) {
      console.log("完整返回:", JSON.stringify(data, null, 2));
      answer = "没有找到答案。";
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.log("Search chat failed:", error);

    return NextResponse.json(
      { answer: "服务器出错了，请稍后再试。" },
      { status: 500 }
    );
  }
}