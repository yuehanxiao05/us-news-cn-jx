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