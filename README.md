# GEMMA Ecosystem - Landing Page

## 🚀 Deploy Rápido na Vercel (Recomendado - Gratuito)

### Passo 1: Suba o projeto no GitHub
1. Crie uma conta no [GitHub](https://github.com) (se não tiver)
2. Crie um novo repositório chamado `gemma-site`
3. Faça upload de TODOS os arquivos desta pasta para o repositório

### Passo 2: Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `gemma-site`
4. A Vercel detecta automaticamente que é um projeto Vite — **não precisa mudar nada**
5. Clique em **"Deploy"**
6. Em ~60 segundos seu site estará no ar com um link tipo: `gemma-site.vercel.app`

### Passo 3: Domínio personalizado (opcional)
- Na Vercel, vá em **Settings > Domains**
- Adicione seu domínio (ex: `gemma.com.br`)
- Configure o DNS conforme as instruções da Vercel

---

## 📸 Adicionando suas imagens

Coloque TODAS as imagens na pasta `public/` com estes nomes exatos:

```
public/
├── Sede1.jpeg
├── Sede2.jpeg
├── Sede3.jpeg
├── Sede4.jpeg
├── Sede5.jpeg
├── Sede6.jpeg
├── Caetano2.jpeg
├── Flavio.jpg
├── Marcelo.jpg
├── Fernando.jpg
├── Felipe.jpg
├── Book.jpg
└── favicon.svg  (já incluído)
```

⚠️ **Os nomes são case-sensitive!** `Sede1.jpeg` ≠ `sede1.jpeg`

---

## 🖥️ Desenvolvimento Local (opcional)

Se quiser testar localmente antes de fazer deploy:

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## 📁 Estrutura do Projeto

```
gemma-site/
├── public/              ← Suas imagens vão aqui
│   └── favicon.svg
├── src/
│   ├── App.jsx          ← Componente principal (seu código)
│   ├── main.jsx         ← Entry point React
│   └── index.css        ← Tailwind CSS
├── index.html           ← HTML principal
├── package.json         ← Dependências
├── vite.config.js       ← Config do Vite
├── tailwind.config.js   ← Config do Tailwind
└── postcss.config.js    ← Config do PostCSS
```

---

## 🔄 Deploy na Turbocloud (alternativa)

Se preferir usar a Turbocloud:
1. Rode `npm run build` localmente
2. Faça upload da pasta `dist/` gerada para a Turbocloud
3. Configure como site estático (Static Site)
4. As imagens devem estar dentro de `dist/` após o build
