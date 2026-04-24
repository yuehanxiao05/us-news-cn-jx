import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

type NewsItem = {
  title: string;
  link: string;
};

type NewsData = {
  finance: NewsItem[];
  entertainment: NewsItem[];
  technology: NewsItem[];
};

// ✅ 缓存（避免频繁调用 OpenAI）
let cache: NewsData | null = null;
let lastFetchTime = 0;

// RSS 来源
const feeds = {
  finance:
    "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
  entertainment:
    "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en",
  technology:
    "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
};

// 获取新闻
async function getFeed(url: string): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url);

  return feed.items.slice(0, 5).map((item) => ({
    title: item.title || "",
    link: item.link || "",
  }));
}

// 批量翻译
async function translateAll(data: NewsData): Promise<NewsData> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("No OpenAI API key");
    return data;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
请把下面 JSON 里的美国新闻标题翻译成中文。

要求：
1. 只翻译 title
2. link 不变
3. 人名、公司名、品牌名、产品名保留英文
4. 只返回 JSON，不要解释

JSON:
${JSON.stringify(data)}
`,
      }),
    });

    const result = await res.json();

    if (result.error) {
      console.log("OpenAI error:", result.error);
      return data;
    }

    // ✅ 正确读取返回内容
    const text = result.output?.[0]?.content?.[0]?.text;

    if (!text) {
      console.log("No text:", result);
      return data;
    }

    const cleaned = text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(cleaned);

  } catch (e) {
    console.log("Translate failed:", e);
    return data;
  }
}

// 主接口
export async function GET() {
  const now = Date.now();

  // ✅ 60秒缓存
  if (cache && now - lastFetchTime < 60000) {
    console.log("Using cache");
    return NextResponse.json(cache);
  }

  const [finance, entertainment, technology] = await Promise.all([
    getFeed(feeds.finance),
    getFeed(feeds.entertainment),
    getFeed(feeds.technology),
  ]);

  const rawData: NewsData = {
    finance,
    entertainment,
    technology,
  };

  const translatedData = await translateAll(rawData);

  // 存缓存
  cache = translatedData;
  lastFetchTime = now;

  return NextResponse.json(translatedData);
}