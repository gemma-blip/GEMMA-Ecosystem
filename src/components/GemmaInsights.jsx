import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronRight, ChevronDown, Lock, RefreshCw } from 'lucide-react';
import { insightsAPI } from '../utils/api';

export default function GemmaInsights({ lang, onAdminClick, translations }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const expandedRef = useRef(null);

  const t = translations;

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 300000);
    return () => clearInterval(interval);
  }, []);

  // Scroll expanded article into view
  useEffect(() => {
    if (expandedId && expandedRef.current) {
      setTimeout(() => {
        expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [expandedId]);

  const fetchArticles = async () => {
    try {
      const response = await insightsAPI.list('published');
      setArticles(response.data || []);
    } catch (err) {
      console.warn('Failed to fetch insights:', err);
      setArticles([]);
    }
    setLoading(false);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString(
      lang === 'pt' ? 'pt-BR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  const getArticleTitle = (article) => {
    if (article.title && typeof article.title === 'object') {
      return article.title[lang] || article.title.pt || article.title.en || 'Untitled';
    }
    return article.title || 'Untitled';
  };

  const getArticleContent = (article) => {
    let content = '';
    if (article.content && typeof article.content === 'object') {
      content = article.content[lang] || article.content.pt || article.content.en || '';
    } else {
      content = article.content || '';
    }
    // Remove leading title heading if it duplicates the article title
    content = content.replace(/^#\s+.*\n+/, '').trim();
    return content;
  };

  const renderMarkdown = (md) => {
    if (!md) return '';
    let html = md
      .replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold text-slate-200 mt-4 mb-2">$1</h4>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-slate-200 mt-5 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-indigo-400 mt-6 mb-3">$1</h2>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
    return `<p class="mb-3">${html}</p>`;
  };

  const getPlainPreview = (content) => {
    return content
      .replace(/^#+\s+.*$/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^[-*]\s/gm, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const getTopicLabel = (topic) => {
    const labels = {
      'flag-theory': { pt: 'Teoria das Bandeiras', en: 'Flag Theory' },
      'tax-planning': { pt: 'Planejamento Tributário', en: 'Tax Planning' },
      'blockchain-innovation': { pt: 'Inovação Blockchain', en: 'Blockchain Innovation' },
    };
    return labels[topic]?.[lang] || topic;
  };

  const handleToggle = (articleId) => {
    setExpandedId(expandedId === articleId ? null : articleId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-indigo-500" size={24} />
          <h3 className="text-2xl font-bold text-white">{t.news.insightsTitle}</h3>
        </div>
        <button
          onClick={onAdminClick}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
          title="Admin Panel"
        >
          <Lock size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>

      <p className="text-slate-400 text-sm font-light mb-2">{t.news.insightsDesc}</p>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm py-8 justify-center">
            <RefreshCw size={16} className="animate-spin" />
            <span>{lang === 'pt' ? 'Carregando artigos...' : 'Loading articles...'}</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
            <BookOpen className="text-slate-700 mx-auto mb-3" size={32} />
            <p className="text-slate-500 text-sm italic">
              {lang === 'pt' ? 'Novos artigos em breve.' : 'New articles coming soon.'}
            </p>
          </div>
        ) : (
          articles.map((article) => {
            const isExpanded = expandedId === article.id;
            return (
              <div
                key={article.id}
                ref={isExpanded ? expandedRef : null}
                className="bg-slate-900 border border-slate-800 rounded-xl transition-colors hover:bg-slate-800/50"
              >
                {/* Header area — always visible, clickable */}
                <div
                  className="p-6 cursor-pointer group"
                  onClick={() => handleToggle(article.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-indigo-500/80 text-xs font-mono">
                      {formatDate(article.publishedAt || article.generatedAt)}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition-colors mb-3">
                    {getArticleTitle(article)}
                  </h4>

                  {!isExpanded && (
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                      {getPlainPreview(getArticleContent(article)).slice(0, 180)}...
                    </p>
                  )}

                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1 group-hover:text-slate-300 transition-colors">
                    {isExpanded
                      ? (lang === 'pt' ? 'Recolher' : 'Collapse')
                      : t.news.readMore
                    }
                    {isExpanded
                      ? <ChevronDown size={14} />
                      : <ChevronRight size={14} />
                    }
                  </span>
                </div>

                {/* Expanded content — separate div, no overflow constraints */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-800/50">
                    <div
                      className="text-slate-400 text-sm leading-relaxed pt-4"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(getArticleContent(article)) }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
