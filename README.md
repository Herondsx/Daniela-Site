# 🖤 O Enigma de Daniela

Um presente de **2 anos e 3 meses** de namoro: um joguinho gótico de enigmas (estilo *Enigma do Medo* + visual de *Stardew Valley*) que, ao ser vencido, revela uma apresentação romântica com as nossas fotos e vídeos.

Tudo roda **100% no navegador** (HTML + CSS + JavaScript puro), então funciona direto no **GitHub Pages**, sem nenhum servidor.

---

## 🎮 Como funciona

1. **`index.html`** → a Daniela escolhe o cabelo (castanho claro ou **ruivo** 🔥) e entra na mansão.
2. Ela anda pelo mapa escuro, coleta as **4 páginas perdidas**, encontra o gato **Logan** 🐈‍⬛ e a cachorra **Mel** 🐕 (que passam a segui-la).
3. Cada página dá um algarismo. Juntando na ordem, ela abre o **portão selado**.
4. Ao tocar no coração do santuário, abre a **recompensa** → `recompensa.html`.

### 🔑 A senha secreta (pra você saber)
O código do portão é **`0 9 0 3`** → **09/03** (9 de março), o dia em que começamos.
As 4 páginas espalhadas pelo mapa dão os dígitos `0`, `9`, `0`, `3` nessa ordem, então ela consegue descobrir sozinha. 😉

---

## 🚀 Publicar no GitHub Pages (passo a passo)

1. Crie um repositório novo no GitHub (ex.: `nossa-historia`).
2. Envie **todos** os arquivos desta pasta para o repositório, **mantendo a estrutura** (inclusive a pasta `Assets` com letra **A maiúscula**, exatamente como está).
   - Pelo site: *Add file → Upload files* → arraste tudo → *Commit*.
   - Ou pelo Git:
     ```bash
     git init
     git add .
     git commit -m "Nossa historia"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/nossa-historia.git
     git push -u origin main
     ```
3. No GitHub, vá em **Settings → Pages**.
4. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
5. Em **Branch**, selecione **main** e a pasta **/ (root)** → **Save**.
6. Aguarde ~1 minuto. O link vai aparecer no topo da página:
   `https://SEU-USUARIO.github.io/nossa-historia/`
7. Mande esse link pra ela (ou abra junto). O jogo começa pelo `index.html` automaticamente. ❤

> ⚠️ **Importante:** o GitHub Pages diferencia maiúsculas/minúsculas. Não renomeie a pasta `Assets` nem os arquivos — os caminhos já estão certinhos no código.

---

## 🧪 Testar no seu PC antes

Abrir o `index.html` direto com 2 cliques **pode bloquear** os vídeos/áudio. O ideal é rodar um servidor local. Com o Node instalado:

```bash
npx serve .
```
…ou qualquer servidor estático. Depois abra o endereço que ele mostrar (ex.: `http://localhost:3000`).

Pra pré-visualizar só a recompensa (sem jogar): abra `recompensa.html`.

---

## 📁 Estrutura

```
index.html            → o jogo (entrada do site)
recompensa.html       → a apresentação final (fotos + vídeos)
css/
  style.css           → visual do jogo (gótico)
  recompensa.css      → visual da apresentação
js/
  audio.js            → trilha e efeitos (sintetizados, sem arquivos)
  sprites.js          → todos os personagens/cenário desenhados em código
  game.js             → motor do jogo (mapa, enigma, diálogos)
  recompensa.js       → galeria de fotos + vídeos tocando juntos
Assets/               → as nossas fotos (.jpeg) e vídeos (.mp4)
```

## ✏️ Quiser mudar textos
- **Legendas das fotos:** array `caps` em `js/recompensa.js`.
- **Carta final:** seção `.letter` em `recompensa.html`.
- **Falas/pistas do jogo:** array `clues` e os diálogos em `js/game.js`.

Feito com muito amor. 🖤
