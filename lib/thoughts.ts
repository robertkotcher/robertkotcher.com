import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const directory = path.join(process.cwd(), "content/thoughts");

export type Thought = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
};

export async function getThoughts(): Promise<Thought[]> {
  const files = await readdir(directory);
  const thoughts = await Promise.all(
    files.filter((file) => /^[a-z0-9-]+\.md$/.test(file)).map(async (file) => {
      const { data, content } = matter(await readFile(path.join(directory, file), "utf8"));
      if (typeof data.title !== "string" || typeof data.date !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
          !Array.isArray(data.tags) || !data.tags.every((tag: unknown) => typeof tag === "string")) {
        throw new Error(`Invalid thought metadata in ${file}. Use a title, quoted YYYY-MM-DD date, and tags list.`);
      }
      return { slug: file.slice(0, -3), title: data.title, date: data.date, tags: data.tags as string[], content };
    }),
  );
  return thoughts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function formatThoughtDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}
