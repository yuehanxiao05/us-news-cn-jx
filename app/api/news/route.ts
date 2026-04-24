import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

let cache: any = null;
let lastFetchTime = 0;

const feeds = {
  finance:
    "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
  entertainment:
    "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en",
  technology:
    "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
};

type NewsItem = {
  title: string;
  link: string;
};

type NewsData = {
  finance: NewsItem[];
  entertainment: NewsItem[];
  technology: NewsItem[];
};

async function getFeed(url: string): Promise<NewsItem[]> {
  const feed = await parser.parseURL(url);

  return feed.items.slice(0, 5).map((item) => ({
    title: item.title || "",
    link: item.link || "",
  }));
}

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
1. 只翻译 title。
2. link 保持不变。
3. 人名、公司名、品牌名、产品名、股票代码保留英文。
4. 不要添加原文没有的信息。
5. 只返回 JSON，不要 markdown，不要解释。

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

    return JSON.parse(text);
  } catch (e) {
    console.log("Translate failed:", e);
    return data;
  }
}

export async function GET() {
  const now = Date.now();

  // 60 秒内直接用缓存，避免频繁调用 OpenAI
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

  cache = translatedData;
  lastFetchTime = now;

  return NextResponse.json(translatedData);
}