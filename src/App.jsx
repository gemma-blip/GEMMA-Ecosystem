import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, Shield, BookOpen, ChevronRight, Menu, X, MapPin, Mail, Cpu, Layers, Database, ExternalLink, BookMarked } from 'lucide-react';
import GemmaInsights from './components/GemmaInsights';
import GlobalRadar from './components/GlobalRadar';
import AdminPanel from './components/AdminPanel';

const LogoGemma = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
    <polyline points="2 8.5 12 15.5 22 8.5" />
    <line x1="12" y1="15.5" x2="12" y2="22" />
    <polygon points="12 2 17 5.5 12 8.5 7 5.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const LogoDiamond = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22L2 9.5l10-8 10 8z" />
    <path d="M2 9.5h20" />
    <path d="M12 1.5v20.5" />
    <path d="M7 9.5L12 22" />
    <path d="M17 9.5L12 22" />
  </svg>
);

const LogoLapis = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
    <line x1="7.5" y1="9.5" x2="7.5" y2="16.5" />
    <line x1="16.5" y1="9.5" x2="16.5" y2="16.5" />
  </svg>
);

const LogoStarEmerald = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#starEmerald)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
    <polygon points="12 6 18 10 18 14 12 18 6 14 6 10" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="22" y1="8.5" x2="18" y2="10" />
    <line x1="22" y1="15.5" x2="18" y2="14" />
    <line x1="12" y1="22" x2="12" y2="18" />
    <line x1="2" y1="15.5" x2="6" y2="14" />
    <line x1="2" y1="8.5" x2="6" y2="10" />
  </svg>
);

const LogoRubyZircon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="url(#rubyZircon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 1 20 5 12 9 4 5" />
    <polygon points="12 8 20 12 12 16 4 12" />
    <polygon points="12 15 20 19 12 23 4 19" />
    <line x1="4" y1="5" x2="4" y2="19" />
    <line x1="20" y1="5" x2="20" y2="19" />
  </svg>
);

const translations = {
  pt: {
    nav: { about: 'Ecossistema', space: 'Sede', team: 'Governança', news: 'Research', contact: 'Contato' },
    hero: {
      badge: 'Gemma Ecosystem',
      title: 'Ecossistema GEMMA. O 1º Consórcio Corporativo Cripto do Brasil.',
      subtitle: 'Estruturamos, governamos e escalamos negócios na criptoeconomia com segurança institucional e rigor jurídico absoluto.',
      cta1: 'Conheça o Ecossistema',
      cta2: 'Governança e Compliance',
    },
    about: {
      title: 'Nossas Verticais de Negócio',
      subtitle: 'Especialização técnica e segurança jurídica em cada camada da criptoeconomia.',
      diamond: { title: 'Diamond Block', desc: 'O braço de infraestrutura tecnológica e serviços do consórcio. Com uma governança corporativa rigorosa desenhada em conjunto por seu Chief Legal Officer e seu Chief Compliance Officer, a Diamond Block garante que as operações de ponta do ecossistema atuem de forma ininterrupta e com segurança jurídica perante os mais altos padrões regulatórios.' },
      lapis: { title: 'Lapis Lazuli Capital', desc: 'Atuando na linha de frente da alocação de capital, esta vertical possui um foco altamente especializado na integração entre criptoativos e o mercado de marketing esportivo, abrindo novas vias institucionais de captação e visibilidade.' },
      starEmerald: { title: 'StarStone Capital & Emerald Block', desc: 'O núcleo de inteligência, consultoria e estruturação avançada do ecossistema. Atuando em forte sinergia, StarStone e Emerald garantem a segurança regulatória, o planejamento tributário de alta complexidade e o compliance das operações onshore e offshore do grupo e de seus parceiros institucionais.' },
      rubyZircon: { title: 'Ruby Block & Zircon Block', desc: 'A fundação operacional e de pesquisa tecnológica do consórcio. Com destaque para a liderança técnica e curadoria de Marcelo Pravatta, essas verticais garantem a infraestrutura crítica, a validação de redes blockchain e a pesquisa contínua necessária para manter o ecossistema na vanguarda das inovações do mercado de ativos digitais.' }
    },
    space: {
      title: 'Sede Corporativa',
      subtitle: 'Um espaço projetado para alta performance institucional e imersão no ecossistema cripto.',
    },
    team: {
      title: 'Governança Corporativa',
      subtitle: 'Liderança institucional e segurança jurídica do ecossistema.',
      members: [
        {
          id: 'caetano',
          name: 'Caetano Manfrini',
          role: 'Chief Legal Officer | CEO StarStone',
          bio: 'Advogado especializado em planejamento patrimonial e tributário. Lidera de Portugal projetos com interface entre Brasil, Europa e outras jurisdições, abrangendo estruturas onshore/offshore, reorganizações societárias e governança patrimonial. É proprietário da Escola Cripto e pioneiro na estruturação de grandes planejamentos jurídicos envolvendo criptoativos e Bitcoin no Brasil. É pós-graduado em Entertainment Law pela CEU Law School e Professor de Pós-Graduação no curso de Direito dos Criptoativos da Escola da Magistratura Federal do Paraná.'
        },
        {
          id: 'flavio',
          name: 'Flavio Moratori',
          role: 'Chief Compliance Officer | CEO Emerald',
          bio: 'Auditor Fiscal da Receita Federal do Brasil aposentado, especializado na aplicação da legislação tributária. Atua como Chief Compliance Officer (CCO) do Ecossistema GEMMA e CEO da Emerald Block. Ao longo de sua carreira pública, participou de diversas operações de combate à lavagem de dinheiro e evasão fiscal. Flávio também ocupou o cargo de Inspetor-Chefe Adjunto da Alfândega no Aeroporto Internacional de Guarulhos, o maior do país.'
        },
        {
          id: 'marcelo',
          name: 'Marcelo Pravatta',
          role: 'Chief Operating Officer | CEO Ruby Block',
          bio: 'Engenheiro eletrônico, investidor e pesquisador focado em criptomoedas e tecnologia blockchain desde 2017. Atua como Chief Operating Officer (COO) do Ecossistema GEMMA e CEO da Ruby Block. É proprietário da Escola Cripto (em conjunto com Caetano Manfrini), entusiasta de economia especializado em ciclos de mercado e operações com derivativos de Bitcoin, além de autor do livro "Ciclos de Mercado e Opções de Bitcoin".'
        },
        {
          id: 'fernando',
          name: 'Fernando Buglia',
          role: 'CEO Zircon Block',
          bio: 'Formado em Física pela Unicamp e pós-graduado em Economia pelo Instituto Mises Brasil. É CEO e cofundador da Zircon Block. Entusiasta e investidor de criptomoedas desde 2017, atua como empreendedor em série, sendo também fundador da Just Inc e do portal 99Cryptos.'
        },
        {
          id: 'felipe',
          name: 'Felipe Rosa',
          role: 'CEO Lapis Lazuli Capital',
          bio: 'Empreendedor de destaque, fundou a InstaDelivery em 2019, que se consolidou no mercado de sistemas de PDV para restaurantes no Brasil. Investidor e entusiasta do ecossistema cripto desde 2017. É o principal executivo da Lapis Lazuli Capital, vertical do Ecossistema GEMMA focada na alocação de ativos e integração com o marketing esportivo.'
        }
      ]
    },
    book: {
      badge: 'Publicação Oficial',
      title: 'Ciclos de Mercado e Opções de Bitcoin',
      subtitle: 'Como operar opções de Bitcoin com estratégias profissionais, ciclos econômicos e gestão de risco em mercados voláteis.',
      author: 'Por Marcelo Pravatta (COO)',
      cta: 'Adquirir na Amazon'
    },
    news: {
      title: 'Market Research & Insights',
      subtitle: 'Inteligência de mercado, rigor jurídico e as principais movimentações da criptoeconomia global.',
      insightsTitle: 'GEMMA Insights',
      insightsDesc: 'Curadoria inteligente supervisionada pela diretoria do consórcio, trazendo as atualizações e papers globais mais precisos sobre planejamento tributário internacional, Teoria das Bandeiras e inovações em blockchain.',
      radarTitle: 'Global Crypto Radar',
      radarDesc: 'Acompanhe em tempo real as atualizações mais críticas do mercado financeiro e de criptoativos, com curadoria automatizada das fontes globais de maior credibilidade.',
      readMore: 'Ler artigo'
    },
    footer: {
      hqTitle: 'SEDE DO ECOSSISTEMA GEMMA',
      hqAddress1: 'Av. Presidente Vargas, 2921, Salas 301/302 – Edifício Sky Towers',
      hqAddress2: 'Indaiatuba – São Paulo | CEP: 13338-705',
      disclaimer: 'AVISO REGULATÓRIO: O Ecossistema GEMMA é um Consórcio de Empresas. Seus arranjos de capital e obrigações mútuas estão estabelecidos em seu agreement de Consórcio. O capital das empresas é formado exclusivamente pelos aportes dos membros constituintes. Ressaltamos que o consórcio e suas afiliadas não exercem, sob nenhuma hipótese, atividades de captação de recursos de terceiros, intermediação financeira ou custódia de criptoativos para o público em geral. Ademais, as empresas do ecossistema não se enquadram no conceito de Prestadoras de Serviços de Ativos Virtuais (PSAVs), nos termos da Lei nº 14.478/2022 (Marco Legal dos Criptoativos) e das Resoluções 519 e 520 do Banco Central do Brasil.',
      rights: '© 2026 Ecossistema GEMMA. Todos os direitos reservados.',
      links: '[ Política de Privacidade ] | [ Termos de Uso ] | [ Código de Ética e Conduta ]'
    }
  },
  en: {
    nav: { about: 'Ecosystem', space: 'HQ', team: 'Governance', news: 'Research', contact: 'Contact' },
    hero: {
      badge: 'Gemma Ecosystem',
      title: 'GEMMA Ecosystem. The 1st Brazilian Crypto-Corporate Consortium.',
      subtitle: 'We structure, govern, and scale crypto businesses with institutional-grade security and absolute legal rigor.',
      cta1: 'Discover the Ecosystem',
      cta2: 'Governance & Compliance',
    },
    about: {
      title: 'Our Business Verticals',
      subtitle: 'Technical expertise and legal security in every layer of the cryptoeconomy.',
      diamond: { title: 'Diamond Block', desc: "The consortium's technological infrastructure and services arm. With rigorous corporate governance designed jointly by its Chief Legal Officer and Chief Compliance Officer, Diamond Block ensures that the ecosystem's cutting-edge operations run uninterrupted and with legal security under the highest regulatory standards." },
      lapis: { title: 'Lapis Lazuli Capital', desc: 'Operating at the forefront of capital allocation, this vertical has a highly specialized focus on the integration between cryptoassets and the sports marketing market, opening new institutional avenues for fundraising and visibility.' },
      starEmerald: { title: 'StarStone Capital & Emerald Block', desc: 'The intelligence, consulting, and advanced structuring core of the ecosystem. Working in strong synergy, StarStone and Emerald ensure regulatory security, highly complex tax planning, and compliance for the onshore and offshore operations of the group and its institutional partners.' },
      rubyZircon: { title: 'Ruby Block & Zircon Block', desc: 'The operational and technological research foundation of the consortium. Highlighting the technical leadership and curation of Marcelo Pravatta, these verticals guarantee the critical infrastructure, blockchain network validation, and continuous research needed to keep the ecosystem at the forefront of digital asset market innovations.' }
    },
    space: {
      title: 'Corporate Headquarters',
      subtitle: 'A space designed for high institutional performance and immersion in the crypto ecosystem.',
    },
    team: {
      title: 'Corporate Governance',
      subtitle: 'Institutional leadership and legal security of the ecosystem.',
      members: [
        {
          id: 'caetano',
          name: 'Caetano Manfrini',
          role: 'Chief Legal Officer | CEO StarStone',
          bio: 'Lawyer specializing in tax and estate planning. Based in Portugal, he leads international projects interfacing with Brazil, Europe, and other jurisdictions, covering onshore/offshore structures, corporate reorganizations, and wealth governance. He is co-owner of Escola Cripto and a pioneer in structuring large legal frameworks involving cryptoassets and Bitcoin in Brazil. He holds a postgraduate degree in Entertainment Law from CEU Law School and is a Postgraduate Professor of Cryptoassets and Blockchain Law at the Federal Magistrates School of Paraná.'
        },
        {
          id: 'flavio',
          name: 'Flavio Moratori',
          role: 'Chief Compliance Officer | CEO Emerald',
          bio: 'Retired Brazilian Internal Revenue Service (IRS) Auditor and Tax Inspector, specialized in tax law enforcement. He acts as the Chief Compliance Officer (CCO) for the GEMMA Ecosystem and CEO of Emerald Block. Throughout his public career, he participated in several operations to combat money laundering and tax evasion. Flavio also held the position of Chief Sub-Inspector of Customs at Guarulhos International Airport, the largest in the country.'
        },
        {
          id: 'marcelo',
          name: 'Marcelo Pravatta',
          role: 'Chief Operating Officer | CEO Ruby Block',
          bio: 'Electronics engineer, investor, and researcher focused on cryptocurrencies and blockchain technology since 2017. He is the Chief Operating Officer (COO) of the GEMMA Ecosystem and CEO of Ruby Block. He is co-owner of Escola Cripto (alongside Caetano Manfrini), an economics enthusiast specialized in market cycles and Bitcoin derivatives trading, and author of the book "Market Cycles and Bitcoin Options".'
        },
        {
          id: 'fernando',
          name: 'Fernando Buglia',
          role: 'CEO Zircon Block',
          bio: 'Holds a degree in Physics from the State University of Campinas (Unicamp) and a postgraduate degree in Economics from the Mises Brasil Institute. He is the CEO and co-founder of Zircon Block. A cryptocurrency enthusiast and investor since 2017, he is a serial entrepreneur, founder of Just Inc and the 99Cryptos portal.'
        },
        {
          id: 'felipe',
          name: 'Felipe Rosa',
          role: 'CEO Lapis Lazuli Capital',
          bio: 'Prominent entrepreneur, he founded InstaDelivery in 2019, which consolidated itself in the POS system market for Brazilian restaurants. Investor and crypto enthusiast since 2017. He is the principal executive of Lapis Lazuli Capital, a GEMMA Ecosystem vertical focused on asset allocation and sports marketing integration.'
        }
      ]
    },
    book: {
      badge: 'Official Publication',
      title: 'Market Cycles and Bitcoin Options',
      subtitle: 'How to trade Bitcoin options with professional strategies, economic cycles, and risk management in volatile markets.',
      author: 'By Marcelo Pravatta (COO)',
      cta: 'Get it on Amazon'
    },
    news: {
      title: 'Market Research & Insights',
      subtitle: 'Market intelligence, legal rigor, and the main movements of the global cryptoeconomy.',
      insightsTitle: 'GEMMA Insights',
      insightsDesc: 'Intelligent curation supervised by the consortium\'s board, bringing the most accurate global updates and papers on international tax planning, Flag Theory, and blockchain innovations.',
      radarTitle: 'Global Crypto Radar',
      radarDesc: 'Track the most critical updates from the financial and cryptoasset markets in real-time, with automated curation from the most credible global sources.',
      readMore: 'Read article'
    },
    footer: {
      hqTitle: 'GEMMA ECOSYSTEM HEADQUARTERS',
      hqAddress1: '2921 Presidente Vargas Avenue, Units 301/302 – Sky Towers Building',
      hqAddress2: 'Indaiatuba – Sao Paulo | 13338-705',
      disclaimer: 'REGULATORY DISCLAIMER: The GEMMA Ecosystem is a Business Consortium. Its capital arrangements and mutual obligations are established in its Consortium agreement. The companies\' capital is formed exclusively by the contributions of the constituent members. We emphasize that the consortium and its affiliates do not, under any circumstances, engage in third-party fundraising activities, financial intermediation, or custody of cryptoassets for the general public. Furthermore, the ecosystem companies do not fall under the concept of Virtual Asset Service Providers (VASPs), in accordance with Law No. 14,478/2022 (Brazilian Cryptoassets Legal Framework) and Central Bank of Brazil Resolutions 519 and 520.',
      rights: '© 2026 GEMMA Ecosystem. All rights reserved.',
      links: '[ Privacy Policy ] | [ Terms of Use ] | [ Code of Ethics & Conduct ]'
    }
  }
};

// Mock data removed - now using live APIs via GemmaInsights and GlobalRadar components

export default function App() {
  const [lang, setLang] = useState('pt');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState([
    { symbol: 'BTC', price: 65430.20, change: 2.5 },
    { symbol: 'ETH', price: 3450.10, change: -1.2 },
    { symbol: 'SOL', price: 145.80, change: 5.4 },
  ]);

  const t = translations[lang];

  const productionImages = {
    sede1: "/Sede1.jpeg",
    sede2: "/Sede2.jpeg",
    sede3: "/Sede3.jpeg",
    sede4: "/Sede4.jpeg",
    sede5: "/Sede5.jpeg",
    sede6: "/Sede6.jpeg",
    caetano: "/Caetano2.jpeg",
    flavio: "/Flavio.jpg",
    marcelo: "/Marcelo.jpg",
    fernando: "/Fernando.jpg",
    felipe: "/Felipe.jpg",
    book: "/Book.jpg"
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null; 
    e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800";
  };
  const handlePortraitError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400";
  }

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        if (!res.ok) throw new Error('API Rate Limit ou Erro de Rede');
        
        const data = await res.json();
        if (data && data.bitcoin) {
            setCryptoPrices([
              { symbol: 'BTC', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
              { symbol: 'ETH', price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
              { symbol: 'SOL', price: data.solana.usd, change: data.solana.usd_24h_change },
            ]);
        }
      } catch (error) {
        console.warn("Utilizando preços estáticos devido a bloqueio de API.", error);
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-indigo-500 selection:text-white">
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="starEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="rubyZircon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>

      <div className="bg-black text-xs text-slate-400 py-2 border-b border-slate-900 overflow-hidden flex">
        <div className="flex animate-marquee whitespace-nowrap gap-8 px-4 w-max">
          {[...cryptoPrices, ...cryptoPrices, ...cryptoPrices, ...cryptoPrices, ...cryptoPrices].map((coin, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-bold text-white">{coin.symbol}/USD</span>
              <span>${coin.price ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
              <span className={coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {coin.change !== undefined ? `${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)}%` : '0.00%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg shadow-black/50 border-b border-slate-800 py-3 top-0' : 'bg-transparent py-5 top-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <LogoGemma className="w-10 h-10 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
              <span className="font-bold text-xl tracking-widest text-white uppercase">Gemma</span>
            </div>

            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
              <a href="#about" className="hover:text-indigo-400 transition-colors tracking-wide">{t.nav.about}</a>
              <a href="#space" className="hover:text-indigo-400 transition-colors tracking-wide">{t.nav.space}</a>
              <a href="#team" className="hover:text-indigo-400 transition-colors tracking-wide">{t.nav.team}</a>
              <a href="#news" className="hover:text-indigo-400 transition-colors tracking-wide">{t.nav.news}</a>
              
              <button onClick={toggleLang} className="flex items-center gap-2 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full">
                <Globe size={14} className="text-indigo-400"/>
                <span className="uppercase text-xs tracking-wider">{lang}</span>
              </button>
            </div>

            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950 pt-24 px-6 flex flex-col gap-6 md:hidden">
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">{t.nav.about}</a>
          <a href="#space" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">{t.nav.space}</a>
          <a href="#team" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">{t.nav.team}</a>
          <a href="#news" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">{t.nav.news}</a>
          <button onClick={() => { toggleLang(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-2xl font-bold text-indigo-500 mt-4">
            <Globe size={24} /> {lang === 'pt' ? 'English' : 'Português'}
          </button>
        </div>
      )}

      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#312e81_0%,_transparent_60%)]"></div>
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2IDguOTU0IDIwIDIwIDIwVjIwSDIweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]"></span>
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-300">{t.hero.badge}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight">
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a href="#about" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] w-full sm:w-auto text-center tracking-wide">
              {t.hero.cta1}
            </a>
            <a href="#team" className="px-8 py-4 bg-transparent border border-slate-600 hover:border-white hover:bg-slate-900 text-white rounded-full font-semibold transition-all w-full sm:w-auto text-center tracking-wide">
              {t.hero.cta2}
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t.about.title}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">{t.about.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-rose-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-900/20 group-hover:border-rose-500/50 transition-colors relative">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent rounded-2xl"></div>
                <LogoRubyZircon className="relative z-10 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t.about.rubyZircon.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm relative z-10">{t.about.rubyZircon.desc}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-cyan-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-900/20 group-hover:border-cyan-500/50 transition-colors relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-2xl"></div>
                <LogoDiamond className="text-cyan-400 relative z-10 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t.about.diamond.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm relative z-10">{t.about.diamond.desc}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/20 group-hover:border-emerald-500/50 transition-colors relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-2xl"></div>
                <LogoStarEmerald className="relative z-10 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t.about.starEmerald.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm relative z-10">{t.about.starEmerald.desc}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 group-hover:border-blue-500/50 transition-colors relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl"></div>
                <LogoLapis className="text-blue-500 relative z-10 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{t.about.lapis.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm relative z-10">{t.about.lapis.desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="space" className="py-24 bg-black border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t.space.title}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">{t.space.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 row-span-2 group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={productionImages.sede3} onError={handleImageError} alt="Sede Gemma" className="w-full h-full object-cover aspect-video md:aspect-auto group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={productionImages.sede1} onError={handleImageError} alt="Sede Entrada" className="w-full h-full object-cover aspect-video sm:aspect-square md:aspect-auto lg:aspect-video group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={productionImages.sede2} onError={handleImageError} alt="Lounge Sede" className="w-full h-full object-cover aspect-video sm:aspect-square md:aspect-auto lg:aspect-video group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={productionImages.sede4} onError={handleImageError} alt="EscolaCripto Space" className="w-full h-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={productionImages.sede5} onError={handleImageError} alt="Meeting Room" className="w-full h-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={productionImages.sede6} onError={handleImageError} alt="Podcast Studio" className="w-full h-full object-cover aspect-video group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t.team.title}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">{t.team.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.team.members.map((member) => (
              <div 
                key={member.id} 
                className="bg-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="shrink-0 rounded-2xl overflow-hidden border border-slate-700 shadow-xl relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500 bg-slate-800 w-32 h-32 mb-6">
                  <img src={productionImages[member.id]} onError={handlePortraitError} alt={member.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="relative z-10 flex-1 w-full">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{member.name}</h3>
                  <div className="inline-flex items-center justify-center w-full gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <p className="text-indigo-400 font-semibold text-xs uppercase tracking-widest whitespace-pre-line text-center">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-light">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-50"></div>
            
            <div className="shrink-0 w-32 h-48 md:w-40 md:h-56 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
               <img src={productionImages.book} onError={handlePortraitError} alt={t.book.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <BookMarked className="absolute bottom-4 right-4 text-white/50" size={20} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">{t.book.badge}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{t.book.title}</h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light mb-4 max-w-2xl">
                {t.book.subtitle}
              </p>
              <p className="text-slate-500 text-sm italic mb-8">{t.book.author}</p>
              
              <a 
                href="https://www.amazon.com.br/Ciclos-Mercado-Op%C3%A7%C3%B5es-Bitcoin-profissionais/dp/B0GNJ1XVCT/ref=mp_s_a_1_1?sr=8-1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white rounded-full font-medium transition-all text-sm"
              >
                {t.book.cta} <ExternalLink size={16} />
              </a>
            </div>
          </div>

        </div>
      </section>

      <section id="news" className="py-24 bg-black border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t.news.title}</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">{t.news.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <GemmaInsights
              lang={lang}
              onAdminClick={() => setAdminPanelOpen(true)}
              translations={t}
            />
            <GlobalRadar
              lang={lang}
              translations={t}
            />
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-slate-950 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <LogoGemma className="w-8 h-8 text-indigo-500" />
                <span className="font-bold text-xl text-white tracking-widest uppercase">Gemma</span>
              </div>
              <div className="bg-black border border-slate-800 p-6 rounded-xl">
                <p className="text-slate-400 text-xs leading-relaxed text-justify">
                  {t.footer.disclaimer}
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t.footer.hqTitle}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" /> 
                  <span className="text-slate-400 text-sm leading-relaxed">
                    {t.footer.hqAddress1}<br />
                    {t.footer.hqAddress2}
                  </span>
                </li>
                <li className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
                  <Mail size={18} className="text-indigo-500 shrink-0" /> 
                  <a href="mailto:compliance@gemma.com.br" className="text-slate-400 hover:text-white transition-colors text-sm">
                    compliance@gemma.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>{t.footer.rights}</p>
            <div className="flex gap-4 font-mono">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">{t.footer.links}</span>
            </div>
          </div>
        </div>
      </footer>

      <AdminPanel
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        lang={lang}
      />
    </div>
  );
}
