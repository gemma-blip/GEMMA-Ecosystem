import React, { useState, useEffect } from 'react';
import { Lock, Send, Check, Trash2, X, Eye, Upload, RefreshCw, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { authAPI, insightsAPI } from '../utils/api';

const TOPICS = [
  { value: 'flag-theory', label: { pt: 'Teoria das Bandeiras', en: 'Flag Theory' } },
  { value: 'tax-planning', label: { pt: 'Planejamento Tributário', en: 'Tax Planning' } },
  { value: 'blockchain-innovation', label: { pt: 'Inovação Blockchain', en: 'Blockchain Innovation' } },
];

export default function AdminPanel({ isOpen, onClose, lang }) {
  const [step, setStep] = useState('login'); // login | dashboard
  const [password, setPassword] = useState('');
  const [topic, setTopic] = useState('flag-theory');
  const [genLanguage, setGenLanguage] = useState('pt');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingArticles, setPendingArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('generate'); // generate | pending | approved | published

  // Check for existing token on mount
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('gemma_admin_token');
      if (token) {
        authAPI.verify()
          .then(() => {
            setStep('dashboard');
            fetchAllArticles();
          })
          .catch(() => {
            localStorage.removeItem('gemma_admin_token');
            setStep('login');
          });
      }
    }
  }, [isOpen]);

  const fetchAllArticles = async () => {
    try {
      const [pending, approved, published] = await Promise.all([
        insightsAPI.list('pending'),
        insightsAPI.list('approved'),
        insightsAPI.list('published'),
      ]);
      setPendingArticles(pending.data || []);
      setApprovedArticles(approved.data || []);
      setPublishedArticles(published.data || []);
    } catch (err) {
      console.error('Fetch articles error:', err);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(password);
      localStorage.setItem('gemma_admin_token', response.data.token);
      setStep('dashboard');
      setPassword('');
      await fetchAllArticles();
    } catch (err) {
      setError(lang === 'pt' ? 'Senha inválida' : 'Invalid password');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('gemma_admin_token');
    setStep('login');
    setPassword('');
    setPendingArticles([]);
    setApprovedArticles([]);
    setPublishedArticles([]);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const response = await insightsAPI.generate(topic, genLanguage);
      setSuccess(lang === 'pt'
        ? `Artigo gerado com sucesso! Título: "${response.data.title}"`
        : `Article generated successfully! Title: "${response.data.title}"`
      );
      setActiveTab('pending');
      await fetchAllArticles();
    } catch (err) {
      setError(lang === 'pt'
        ? `Erro ao gerar artigo: ${err.response?.data?.error || err.message}`
        : `Generation error: ${err.response?.data?.error || err.message}`
      );
    }
    setGenerating(false);
  };

  const handleApprove = async (articleId) => {
    try {
      await insightsAPI.approve(articleId);
      setSuccess(lang === 'pt' ? 'Artigo aprovado!' : 'Article approved!');
      await fetchAllArticles();
    } catch (err) {
      setError(lang === 'pt' ? 'Erro ao aprovar' : 'Approval failed');
    }
  };

  const handlePublish = async (articleId) => {
    try {
      await insightsAPI.publish(articleId);
      setSuccess(lang === 'pt' ? 'Artigo publicado no site!' : 'Article published to site!');
      await fetchAllArticles();
    } catch (err) {
      setError(lang === 'pt' ? 'Erro ao publicar' : 'Publish failed');
    }
  };

  const handleDelete = async (articleId, status) => {
    if (!confirm(lang === 'pt' ? 'Tem certeza que deseja excluir este artigo?' : 'Are you sure you want to delete this article?')) {
      return;
    }
    try {
      await insightsAPI.delete(articleId, status);
      setSuccess(lang === 'pt' ? 'Artigo excluído' : 'Article deleted');
      await fetchAllArticles();
    } catch (err) {
      setError(lang === 'pt' ? 'Erro ao excluir' : 'Delete failed');
    }
  };

  const getArticleTitle = (article) => {
    if (article.title && typeof article.title === 'object') {
      return article.title[article.language] || article.title.pt || article.title.en || 'Untitled';
    }
    return article.title || 'Untitled';
  };

  const getArticleContent = (article) => {
    if (article.content && typeof article.content === 'object') {
      return article.content[article.language] || article.content.pt || article.content.en || '';
    }
    return article.content || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock size={20} className="text-indigo-500" />
            GEMMA Admin Panel
          </h2>
          <div className="flex items-center gap-2">
            {step === 'dashboard' && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="text-slate-400" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}
          {success && (
            <div className="bg-emerald-900/20 border border-emerald-800 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-between">
              <span>{success}</span>
              <button onClick={() => setSuccess('')}><X size={14} /></button>
            </div>
          )}

          {step === 'login' ? (
            /* Login Form */
            <div className="max-w-sm mx-auto mt-12">
              <div className="text-center mb-8">
                <Lock size={48} className="text-indigo-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {lang === 'pt' ? 'Acesso Restrito' : 'Restricted Access'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {lang === 'pt' ? 'Insira a senha de administrador' : 'Enter the admin password'}
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder={lang === 'pt' ? 'Senha de administrador' : 'Admin password'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleLogin}
                  disabled={loading || !password}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <RefreshCw size={16} className="animate-spin" />
                      {lang === 'pt' ? 'Entrando...' : 'Logging in...'}
                    </span>
                  ) : (
                    lang === 'pt' ? 'Entrar' : 'Login'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Dashboard */
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
                {[
                  { key: 'generate', label: lang === 'pt' ? 'Gerar Artigo' : 'Generate', icon: Send },
                  { key: 'pending', label: `${lang === 'pt' ? 'Pendentes' : 'Pending'} (${pendingArticles.length})`, icon: Eye },
                  { key: 'approved', label: `${lang === 'pt' ? 'Aprovados' : 'Approved'} (${approvedArticles.length})`, icon: Check },
                  { key: 'published', label: `${lang === 'pt' ? 'Publicados' : 'Published'} (${publishedArticles.length})`, icon: Upload },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Generate Tab */}
              {activeTab === 'generate' && (
                <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/30">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {lang === 'pt' ? 'Gerar Novo Artigo com IA' : 'Generate New AI Article'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    {lang === 'pt'
                      ? 'O Claude irá gerar um artigo profissional que ficará pendente para aprovação.'
                      : 'Claude will generate a professional article that will be pending approval.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {lang === 'pt' ? 'Tema' : 'Topic'}
                      </label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      >
                        {TOPICS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label[lang]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {lang === 'pt' ? 'Idioma do Artigo' : 'Article Language'}
                      </label>
                      <select
                        value={genLanguage}
                        onChange={(e) => setGenLanguage(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        {lang === 'pt' ? 'Gerando artigo com IA (pode levar ~30s)...' : 'Generating with AI (~30s)...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {lang === 'pt' ? 'Gerar Artigo' : 'Generate Article'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Article Lists */}
              {activeTab === 'pending' && (
                <ArticleList
                  articles={pendingArticles}
                  lang={lang}
                  emptyMessage={lang === 'pt' ? 'Nenhum artigo pendente' : 'No pending articles'}
                  getTitle={getArticleTitle}
                  getContent={getArticleContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  actions={(article) => (
                    <>
                      <button
                        onClick={() => handleApprove(article.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Check size={14} /> {lang === 'pt' ? 'Aprovar' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, 'pending')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-800"
                      >
                        <Trash2 size={14} /> {lang === 'pt' ? 'Excluir' : 'Delete'}
                      </button>
                    </>
                  )}
                />
              )}

              {activeTab === 'approved' && (
                <ArticleList
                  articles={approvedArticles}
                  lang={lang}
                  emptyMessage={lang === 'pt' ? 'Nenhum artigo aprovado' : 'No approved articles'}
                  getTitle={getArticleTitle}
                  getContent={getArticleContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  actions={(article) => (
                    <>
                      <button
                        onClick={() => handlePublish(article.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Upload size={14} /> {lang === 'pt' ? 'Publicar' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                />
              )}

              {activeTab === 'published' && (
                <ArticleList
                  articles={publishedArticles}
                  lang={lang}
                  emptyMessage={lang === 'pt' ? 'Nenhum artigo publicado' : 'No published articles'}
                  getTitle={getArticleTitle}
                  getContent={getArticleContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  actions={(article) => (
                    <button
                      onClick={() => handleDelete(article.id, 'published')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-800"
                    >
                      <Trash2 size={14} /> {lang === 'pt' ? 'Remover' : 'Remove'}
                    </button>
                  )}
                />
              )}

              {/* Refresh button */}
              <button
                onClick={fetchAllArticles}
                className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
              >
                <RefreshCw size={14} />
                {lang === 'pt' ? 'Atualizar lista' : 'Refresh list'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Reusable Article List Component */
function ArticleList({ articles, lang, emptyMessage, getTitle, getContent, expandedArticle, setExpandedArticle, actions }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm italic">
        {emptyMessage}
      </div>
    );
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString(
      lang === 'pt' ? 'pt-BR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const TOPIC_LABELS = {
    'flag-theory': { pt: 'Teoria das Bandeiras', en: 'Flag Theory' },
    'tax-planning': { pt: 'Planejamento Tributário', en: 'Tax Planning' },
    'blockchain-innovation': { pt: 'Inovação Blockchain', en: 'Blockchain Innovation' },
  };

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div key={article.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div
            className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
            onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {article.topic && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {TOPIC_LABELS[article.topic]?.[lang] || article.topic}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-mono">
                    {formatDate(article.generatedAt)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {article.language || '?'}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{getTitle(article)}</h4>
              </div>
              {expandedArticle === article.id ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
            </div>
          </div>

          {expandedArticle === article.id && (
            <div className="border-t border-slate-800">
              <div className="p-4 max-h-64 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {getContent(article)}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/50 border-t border-slate-800">
                {actions(article)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
