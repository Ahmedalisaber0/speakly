"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  searchNews,
  translateNewsArticlesBatch,
  fetchCloudVoices,
  speakCloud,
  NewsArticle,
  CloudVoice,
} from "@/lib/api";
import NewsLanguagePicker from "@/components/NewsLanguagePicker";
import { Language, LANGUAGE_CODES } from "@/types";

interface ArticleTranslation {
  status: "loading" | "done" | "error";
  translatedTitle?: string;
  summary?: string;
  error?: string;
}

export default function NewsPage() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [translations, setTranslations] = useState<Record<number, ArticleTranslation>>({});
  const [voices, setVoices] = useState<CloudVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<CloudVoice | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!targetLanguage) {
      setVoices([]);
      setSelectedVoice(null);
      return;
    }
    let cancelled = false;
    const code = LANGUAGE_CODES[targetLanguage].split("-")[0];
    fetchCloudVoices(code)
      .then((list) => {
        if (cancelled) return;
        setVoices(list);
        setSelectedVoice(list[0] ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setVoices([]);
        setSelectedVoice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [targetLanguage]);

  const handleListen = async (index: number, text: string) => {
    if (!selectedVoice || !text) return;
    setPlayingIndex(index);
    try {
      await speakCloud(text, selectedVoice.id);
    } catch (err) {
      console.error("TTS playback failed", err);
    } finally {
      setPlayingIndex(null);
    }
  };

  const translateArticles = async (items: NewsArticle[], lang: Language) => {
    const initial: Record<number, ArticleTranslation> = {};
    items.forEach((_, i) => {
      initial[i] = { status: "loading" };
    });
    setTranslations(initial);

    try {
      const { translations } = await translateNewsArticlesBatch(
        items.map((a) => ({ title: a.title, body: a.body })),
        lang
      );
      const next: Record<number, ArticleTranslation> = {};
      items.forEach((_, i) => {
        const t = translations[i];
        next[i] = {
          status: "done",
          translatedTitle: t?.translated_title || "",
          summary: t?.summary || "",
        };
      });
      setTranslations(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Translation failed";
      const next: Record<number, ArticleTranslation> = {};
      items.forEach((_, i) => {
        next[i] = { status: "error", error: message };
      });
      setTranslations(next);
    }
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setIsLoading(true);
    setError(null);
    setSearched(true);
    setTranslations({});
    try {
      const data = await searchNews(q, 5);
      setArticles(data.articles);
      if (targetLanguage && data.articles.length > 0) {
        translateArticles(data.articles, targetLanguage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search news");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language | null) => {
    setTargetLanguage(lang);
    if (lang && articles.length > 0) {
      translateArticles(articles, lang);
    } else {
      setTranslations({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
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

      {/* Body: sidebar (language picker) + main (search + results) */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl w-full mx-auto overflow-hidden">
        <NewsLanguagePicker
          value={targetLanguage}
          onChange={handleLanguageChange}
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
        />

        <div className="flex-1 flex flex-col min-h-0">
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

            {articles.map((article, i) => {
              const t = translations[i];
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                >
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
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

                  {targetLanguage && t && (() => {
                    const hasContent =
                      t.status === "done" && (t.translatedTitle || t.summary);
                    const isEmptyDone =
                      t.status === "done" && !t.translatedTitle && !t.summary;

                    return (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                        {t.status === "loading" && (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                            <div className="h-2.5 bg-gray-200 rounded w-full" />
                            <div className="h-2.5 bg-gray-200 rounded w-5/6" />
                          </div>
                        )}

                        {hasContent && (
                          <>
                            {t.translatedTitle && (
                              <p
                                className="text-sm font-medium text-gray-800"
                                dir="auto"
                              >
                                {t.translatedTitle}
                              </p>
                            )}
                            {t.summary && (
                              <p className="text-xs text-gray-600 leading-relaxed" dir="auto">
                                {t.summary}
                              </p>
                            )}
                            {selectedVoice && (
                              <button
                                onClick={() =>
                                  handleListen(
                                    i,
                                    [t.translatedTitle, t.summary]
                                      .filter(Boolean)
                                      .join(". ")
                                  )
                                }
                                disabled={playingIndex === i}
                                className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-xs text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                {playingIndex === i ? (
                                  <>
                                    <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 4v16M8 8v8M16 8v8M4 11v2M20 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                    </svg>
                                    Playing...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4.03v8.05A4.5 4.5 0 0016.5 12zM14 3.23v2.06a7.001 7.001 0 010 13.42v2.06A9.001 9.001 0 0023 12 9 9 0 0014 3.23z"/>
                                    </svg>
                                    Listen
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}

                        {isEmptyDone && (
                          <p className="text-xs text-amber-600">
                            Translation unavailable for this article. Try a different
                            target language or search again.
                          </p>
                        )}

                        {t.status === "error" && (
                          <p className="text-xs text-red-500">
                            Couldn&apos;t generate translation: {t.error}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
