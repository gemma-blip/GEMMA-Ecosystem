import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { radarAPI } from '../utils/api';

export default function GlobalRadar({ lang, translations }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const t = translations;

  useEffect(() => {
    fetchRadar();
    const interval = setInterval(fetchRadar, 120000); // Refresh every 2 min
    return () => clearInterval(interval);
  }, []);

  const fetchRadar = async () => {
    try {
      const response = await radarAPI.feed(10);
      const data = Array.isArray(response.data) ? response.data : [];
      setFeed(data);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Failed to fetch radar:', err);
      setError(lang === 'pt' ? 'Feed indisponível' : 'Feed unavailable');
      // Keep existing feed data on error
    }
    setLoading(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
    return `${Math.floor(diffSeconds / 86400)}d`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Database className="text-indigo-500" size={24} />
        <h3 className="text-2xl font-bold text-white">{t.news.radarTitle}</h3>
        {!loading && feed.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-semibold tracking-wider">LIVE</span>
          </div>
        )}
      </div>

      <p className="text-slate-400 text-sm font-light mb-2">{t.news.radarDesc}</p>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm p-8 justify-center">
            <RefreshCw size={16} className="animate-spin" />
            <span>{lang === 'pt' ? 'Carregando feed...' : 'Loading feed...'}</span>
          </div>
        ) : error && feed.length === 0 ? (
          <div className="flex items-center gap-3 text-slate-500 text-sm p-8 justify-center">
            <AlertCircle size={16} className="text-amber-500" />
            <span>{error}</span>
          </div>
        ) : feed.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="text-slate-700 mx-auto mb-3" size={32} />
            <p className="text-slate-500 text-sm italic">
              {lang === 'pt' ? 'Nenhuma notícia disponível.' : 'No news available.'}
            </p>
          </div>
        ) : (
          <>
            {feed.map((item, idx) => (
              <a
                href={item.newsUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                key={item.id}
                className={`block p-5 hover:bg-slate-800/50 transition-colors group ${
                  idx !== feed.length - 1 ? 'border-b border-slate-800' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-indigo-400 text-xs font-semibold">{item.source}</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-500 text-xs">{item.time || formatTime(item.timestamp)}</span>
                      {item.currencies && item.currencies.length > 0 && (
                        <>
                          <span className="text-slate-600 text-xs">·</span>
                          {item.currencies.map((code) => (
                            <span key={code} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {code}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                      {item.title}
                    </h4>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
                </div>
              </a>
            ))}

            {lastUpdated && (
              <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50">
                <p className="text-slate-600 text-xs text-center">
                  {lang === 'pt' ? 'Última atualização' : 'Last updated'}: {lastUpdated.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US')}
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
