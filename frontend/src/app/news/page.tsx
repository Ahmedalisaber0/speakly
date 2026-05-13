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
    <div className="h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Modern Header with Backdrop Blur */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-azure)] bg-clip-text text-transparent">
              Speakly
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Practice
              </Link>
              <Link href="/translate" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Translate
              </Link>
              <Link href="/news" className="font-semibold text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]">
                News
              </Link>
              <Link href="/settings" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Settings
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Language & Voice Selector */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-y-auto">
          <div className="p-6">
            <NewsLanguagePicker
              value={targetLanguage}
              onChange={handleLanguageChange}
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Search Section */}
          <div className="px-6 py-6 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search news articles..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSearch}
                  disabled={!query.trim() || isLoading}
                  className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin-slow">⚙️</span>
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Error State */}
            {error && (
              <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-down">
                <p className="text-red-800 dark:text-red-200 font-semibold">Error</p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!searched && !isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl mb-4">📰</p>
                  <p className="h2 text-[var(--text-primary)]">Search for news</p>
                  <p className="text-[var(--text-secondary)] mt-2">Enter keywords to find translated news articles</p>
                </div>
              </div>
            )}

            {/* No Results */}
            {searched && !isLoading && articles.length === 0 && !error && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="h2 text-[var(--text-primary)]">No articles found</p>
                  <p className="text-[var(--text-secondary)] mt-2">Try different search terms</p>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {articles.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                {articles.map((article, i) => {
                  const t = translations[i];
                  return (
                    <a
                      key={i}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden hover:shadow-lg hover:border-[var(--color-primary)] transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        {/* Article Image */}
                        {article.image && (
                          <div className="w-full sm:w-48 h-32 flex-shrink-0">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}

                        {/* Article Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          {/* Original Title */}
                          <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                            {article.title}
                          </h3>

                          {/* Source & Date */}
                          <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-1">
                            {article.source}
                          </p>

                          {/* Translated Title */}
                          {targetLanguage && (
                            <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
                              {t?.status === "loading" && (
                                <div className="space-y-2">
                                  <div className="h-3 bg-[var(--bg-muted)] rounded animate-pulse w-3/4"></div>
                                  <div className="h-3 bg-[var(--bg-muted)] rounded animate-pulse w-1/2"></div>
                                </div>
                              )}
                              {t?.status === "done" && t?.translatedTitle && (
                                <div>
                                  <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide mb-1">Translated</p>
                                  <p className="text-sm text-[var(--text-primary)] line-clamp-2">
                                    {t.translatedTitle}
                                  </p>
                                  {t.summary && (
                                    <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
                                      {t.summary}
                                    </p>
                                  )}
                                </div>
                              )}
                              {t?.status === "error" && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  Translation failed
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Listen Button */}
                      {selectedVoice && t?.status === "done" && (t?.translatedTitle || t?.summary) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleListen(
                              i,
                              [t.translatedTitle, t.summary].filter(Boolean).join(". ")
                            );
                          }}
                          className="w-full px-4 py-3 border-t border-[var(--border-primary)] text-[var(--color-primary)] hover:bg-[var(--bg-muted)] font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {playingIndex === i ? (
                            <>
                              <span className="animate-spin-slow">🔊</span>
                              <span>Playing...</span>
                            </>
                          ) : (
                            <>
                              <span>🔊</span>
                              <span>Listen to Translation</span>
                            </>
                          )}
                        </button>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
