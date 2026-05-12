import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

type NewsItem = {
  title: string;
  link: string;
  summary?: string;
};

type NewsData = {
  finance: NewsItem[];
  entertainment: NewsItem[];
  technology: NewsItem[];
};

let cache: NewsData | null = null;
let lastFetchTime = 0;

const feeds = {
  finance:
    "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
  entertainment:
    "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en",
  technology:
    "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
};

async function getFeed(url: string): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url);

  return feed.items.slice(0, 5).map((item) => ({
    title: item.title || "",
    link: item.link || "",
    summary: item.contentSnippet || "",
  }));
}

async function enhanceNews(data: NewsData): Promise<NewsData> {
  if (!process.env.OPENAI_API_KEY) {
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
请处理下面 JSON 里的美国新闻。

要求：
1. title 翻译成中文。
2. 每条新闻增加/改写 summary，summary 用中文写 2-4 句，信息量更丰富。
3. 人名、公司名、品牌名、产品名、股票代码保留英文。
4. 不要添加原文没有的信息。
5. link 保持不变。
6. 只返回 JSON，不要 markdown，不要解释。

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
    console.log("Enhance failed:", e);
    return data;
  }
}

export async function GET() {
  const now = Date.now();

  // 10分钟缓存，省钱也避免 rate limit
  if (cache && now - lastFetchTime < 10 * 60 * 1000) {
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

  const enhancedData = await enhanceNews(rawData);

  cache = enhancedData;
  lastFetchTime = now;

  return NextResponse.json(enhancedData);
}