import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ answer: "请输入问题。" }, { status: 400 });
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
1. 可以联网搜索公开网页。
2. 人名、公司名、产品名、品牌名保留英文。
3. 回答简洁清楚。
4. 如果信息不确定，请说明不确定。

用户问题：
${question}
`,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({
        answer: `搜索失败：${data.error.message}`,
      });
    }

    const answer = data.output_text || data.output?.[0]?.content?.[0]?.text || "没有找到答案。";

    return NextResponse.json({ answer });
  } catch (e) {
    console.log("Search chat failed:", e);
    return NextResponse.json(
      { answer: "服务器出错了，请稍后再试。" },
      { status: 500 }
    );
  }
}