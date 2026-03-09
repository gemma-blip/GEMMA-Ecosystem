import React, { useState, useEffect } from 'react';
import { Database, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { radarAPI } from '../utils/api';

export default function GlobalRadar({ lang, translations }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const t = translations;

  useEffect(() => {
    fetchRadar();
    const interval = setInterval(fetchRadar, 3600000); // Refresh every 1h
    return () => clearInterval(interval);
  }, []);

  const fetchRadar = async () => {
    try {
      const response = await radarAPI.feed();
      const data = Array.isArray(response.data) ? response.data : [];
      setFeed(data);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Failed to fetch radar:', err);
      setError(lang === 'pt' ? 'Feed indisponível' : 'Feed unavailable');
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString(
      lang === 'pt' ? 'pt-BR' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Database className="text-indigo-500" size={24} />
        <h3 className="text-2xl font-bold text-white">{t.news.radarTitle}</h3>
      </div>

      <p className="text-slate-400 text-sm font-light mb-2">{t.news.radarDesc}</p>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm py-8 justify-center">
            <RefreshCw size={16} className="animate-spin" />
            <span>{lang === 'pt' ? 'Carregando feed...' : 'Loading feed...'}</span>
          </div>
        ) : error && feed.length === 0 ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm py-8 justify-center">
            <AlertCircle size={16} className="text-amber-500" />
            <span>{error}</span>
          </div>
        ) : feed.length === 0 ? (
          <div className="py-8 text-center">
            <Database className="text-slate-700 mx-auto mb-3" size={32} />
            <p className="text-slate-500 text-sm italic">
              {lang === 'pt' ? 'Nenhuma notícia disponível.' : 'No news available.'}
            </p>
          </div>
        ) : (
          <>
            {feed.map((item) => (
              <a
                href={item.newsUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                key={item.id}
                className="block bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800/50 hover:border-slate-700 transition-all group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-indigo-400 text-xs font-semibold">{item.source}</span>
                      <span className="text-slate-700 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{(item.date && typeof item.date === 'object' ? item.date[lang] : item.date) || formatDate(item.timestamp)}</span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                      {item.title && typeof item.title === 'object' ? (item.title[lang] || item.title.en) : item.title}
                    </h4>
                  </div>
                  <ExternalLink size={14} className="text-slate-700 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
                </div>
              </a>
            ))}

            {lastUpdated && (
              <div className="pt-2">
                <p className="text-slate-600 text-xs text-center">
                  {lang === 'pt' ? 'Última atualização' : 'Last updated'}: {lastUpdated.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  <button onClick={fetchRadar} className="text-indigo-500 hover:text-indigo-400 transition-colors">
                    {lang === 'pt' ? 'Atualizar' : 'Refresh'}
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
