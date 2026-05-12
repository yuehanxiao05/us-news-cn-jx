import ChatBox from "./ChatBox";

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

async function getNews(): Promise<NewsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/news`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("API 请求失败");
  }

  return res.json();
}

export default async function Home() {
  const data = await getNews();

  return (
    <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
      <h1>美国新闻</h1>
      <ChatBox />
      <p style={{ color: "#666", marginBottom: 32 }}>
        Finance、Entertainment、Technology 每类 Top 5，中文标题与详细概括。
      </p>

      <Section title="Finance" items={data.finance} />
      <Section title="Entertainment" items={data.entertainment} />
      <Section title="Technology" items={data.technology} />
    </main>
  );
}

function Section({ title, items }: { title: string; items: NewsItem[] }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2>{title}</h2>

      {items.map((item, index) => (
        <article
          key={item.link}
          style={{
            marginBottom: 24,
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          <h3>
            {index + 1}. {item.title}
          </h3>

          <p style={{ lineHeight: 1.7, color: "#333" }}>
            {item.summary || "暂无概括"}
          </p>

          <a href={item.link} target="_blank">
            阅读原文
          </a>
        </article>
      ))}
    </section>
  );
}