type NewsItem = {
  title: string;
  link: string;
};

type NewsData = {
  finance: NewsItem[];
  entertainment: NewsItem[];
  technology: NewsItem[];
};

async function getNews(): Promise<NewsData> {
  const res = await fetch("http://127.0.0.1:3000/api/news", {
    cache: "no-store",
  });

  const text = await res.text();

  if (!text) {
    throw new Error("API 返回空内容，请检查 /api/news");
  }

  try {
    return JSON.parse(text);
  } catch {
    console.log("API 返回的不是 JSON:", text);
    throw new Error("API 返回的不是 JSON");
  }
}

export default async function Home() {
  const data = await getNews();

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>美国新闻</h1>

      <Section title="Finance" items={data.finance} />
      <Section title="Entertainment" items={data.entertainment} />
      <Section title="Technology" items={data.technology} />
    </main>
  );
}

function Section({ title, items }: { title: string; items: NewsItem[] }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2>{title}</h2>

      {items.map((item, index) => (
        <div key={item.link} style={{ marginBottom: 20 }}>
          <h3>
            {index + 1}. {item.title}
          </h3>
          <a href={item.link} target="_blank">
            阅读原文
          </a>
        </div>
      ))}
    </div>
  );
}