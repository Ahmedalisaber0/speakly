"use client";

import { useState } from "react";
import Link from "next/link";
import { searchNews, NewsArticle } from "@/lib/api";

export default function NewsPage() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setIsLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchNews(q);
      setArticles(data.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search news");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800">Speakly</h1>
          <div className="flex gap-4 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Practice
            </Link>
            <Link
              href="/translate"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Translate
            </Link>
            <Link href="/news" className="text-blue-600 font-medium">
              News
            </Link>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search news... (e.g. technology, sports, AI)"
            disabled={isLoading}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-100"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 rounded-lg p-3">
            {error}
          </div>
        )}

        {!searched && !isLoading && (
          <div className="text-center text-gray-400 mt-20">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <p className="text-lg">Search the latest news</p>
            <p className="text-sm mt-1">
              Enter a topic to find recent news articles
            </p>
          </div>
        )}

        {searched && !isLoading && articles.length === 0 && !error && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">No results found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex">
              {article.image && (
                <div className="w-32 h-28 flex-shrink-0">
                  <img
                    src={article.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
                  {article.title}
                </h3>
                {article.body && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                    {article.body}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  {article.source && <span>{article.source}</span>}
                  {article.source && article.date && (
                    <span className="text-gray-300">|</span>
                  )}
                  {article.date && (
                    <span>
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
