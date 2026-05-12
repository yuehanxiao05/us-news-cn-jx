import ChatBox from "./ChatBox";
import NewsCard from "./NewsCard";

type NewsItem = {
  title: string;
  link: string;
  summary?: string;
};

type NewsData = {
  finance?: NewsItem[];
  entertainment?: NewsItem[];
  technology?: NewsItem[];
};

async function getNews(): Promise<NewsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/news`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.log("API 请求失败:", res.status);
    return {};
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

      <Section title="Finance" items={data.finance || []} />
      <Section title="Entertainment" items={data.entertainment || []} />
      <Section title="Technology" items={data.technology || []} />
    </main>
  );
}

function Section({ title, items }: { title: string; items: NewsItem[] }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2>{title}</h2>

      {items.length === 0 ? (
        <p style={{ color: "#777" }}>暂无新闻</p>
      ) : (
        items.map((item, index) => (
          <NewsCard
            key={item.link || `${title}-${index}`}
            index={index}
            title={item.title}
            summary={item.summary}
            link={item.link}
          />
        ))
      )}
    </section>
  );
}