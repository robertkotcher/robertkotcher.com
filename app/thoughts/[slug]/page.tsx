import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyableCodeBlock from "../CopyableCodeBlock";
import { formatThoughtDate, getThoughts } from "@/lib/thoughts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getThoughts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const thought = (await getThoughts()).find((item) => item.slug === slug);
  if (!thought) return {};
  return {
    title: `${thought.title} | Robert Kotcher`,
    description: thought.content.split(/\n\s*\n/)[0],
    alternates: { canonical: `/thoughts/${slug}` },
    openGraph: { title: thought.title, url: `/thoughts/${slug}`, type: "article", publishedTime: thought.date, tags: thought.tags },
  };
}

export default async function ThoughtPage({ params }: Props) {
  const { slug } = await params;
  const thought = (await getThoughts()).find((item) => item.slug === slug);
  if (!thought) notFound();
  return (
    <>
      <article className="thought-article">
        <h1>{thought.title}</h1>
        <div className="thought-meta">
          <time dateTime={thought.date}>{formatThoughtDate(thought.date)}</time>
          <span className="thought-tags">{thought.tags.map((tag) => <span key={tag}>#{tag}</span>)}</span>
        </div>
        <div className="thought-content"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: ({ children }) => <CopyableCodeBlock>{children}</CopyableCodeBlock> }}>{thought.content}</ReactMarkdown></div>
      </article>
    </>
  );
}
