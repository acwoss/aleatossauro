# Clone fiel do Chrome Dino (T-Rex) — Canvas 2D

Data: 2026-08-28  
Projeto: aleatossauro  
Status: aprovado (critique 1A–4A resolvidos em 2026-08-28)

## Objetivo

Recriar o jogo T-Rex do Google Chrome (`chrome://dino`) em HTML, CSS e JavaScript puros. Jogabilidade e visual 1-bit fiéis ao original. Identidade própria só no sentido de **não copiar a sprite sheet do Chromium** (arte protegida); silhueta, timing e regras devem parecer o mesmo jogo.

Fora de escopo: som, PWA, gamepad, bundler, framework, servidor, ranking online, pausa explícita, configurações.

## Decisões fechadas com o usuário

| Tópico | Decisão |
|--------|---------|
| Fidelidade | Clone fiel (não MVP mínimo, não reskin “Aleatossauro”) |
| Plataformas | Desktop e celular |
| Controles desktop | Espaço / ↑ pular; ↓ agachar |
| Controles celular | Toque = pular; swipe para baixo = agachar |
| Apresentação | Tela cheia: o canvas ocupa a janela |
| Render | Canvas 2D + `requestAnimationFrame` |
| Assets | Pixel art 1-bit desenhado no código |
| Escala (critique 1A) | Altura lógica 150 px; largura lógica = largura da janela / escala; faixa centralizada; escala `clamp(innerWidth/600, 1, innerHeight*0.45/150)` |
| Física (critique 2A) | Copiar constantes do runner Chromium (`offline.ts` / `trex.ts` / sprite defs), modo normal (não slow/a11y) |
| Game over (critique 3A) | Texto `GAME OVER` em inglês |
| Tema inicial (critique 4A) | Sempre fundo claro `#f7f7f7` / traço `#535353` até o modo noite do jogo; ignorar `prefers-color-scheme` |

## Arquitetura

Página única. `index.html` contém um `<canvas>` que cobre a viewport. CSS zera margem/padding, `overflow: hidden`, `touch-action: none`, `user-select: none`. Sem chrome de página (sem título, HUD HTML ou botões).

O canvas CSS é `100vw × 100vh`. O mundo lógico tem **altura 150** e **largura = `round(innerWidth / scale)`**, com

`scale = clamp(innerWidth / 600, 1, innerHeight * 0.45 / 150)`.

A faixa do jogo é desenhada no centro vertical; o restante da tela é a cor de fundo. `devicePixelRatio` entra só no buffer do canvas (`imageSmoothingEnabled = false`). Em telefone estreito `scale` fica 1 e a largura lógica acompanha a janela (jogável, ~150 px de altura). Em desktop largo a escala sobe e a largura lógica fica perto de 600, como o arcade mode do Chrome.

Abrir `index.html` no navegador deve bastar (sem servidor). Scripts clássicos (`<script src>`), não ES modules — `file://` quebra `import` em vários navegadores.

Estados da partida:

1. **WAITING** — horizonte e dino parados; dino pisca; espera o primeiro pulo.
2. **RUNNING** — física, spawn, score, noite.
3. **CRASHED** — dino morto, “GAME OVER”, ícone de restart; Espaço/↑/toque reinicia.

Transição WAITING → RUNNING no primeiro pulo válido. CRASHED → RUNNING no restart (reset de obstáculos, velocidade e score da partida; HI permanece).

### Arquivos

```
index.html
css/style.css
js/config.js      constantes Chromium + cores + storage key
js/layout.js      scale / logicalWidth / offsetY
js/input.js       teclado + toque
js/collision.js   AABB boxCompare
js/sprites.js     bitmaps 1-bit e drawBitmap
js/trex.js
js/horizon.js     chão, nuvens, linha
js/obstacles.js
js/hud.js         score, HI, GAME OVER
js/game.js        loop, estado, colisão, noite, orquestração
tests/            node:test (sem npm) para lógica pura
```

Um objeto `Game` é o único dono do estado. Sem store externo.

## Peças

### T-Rex

- Corre no chão; pula; agacha.
- Pulo: impulso + gravidade, como o Chrome. ↓ no ar **corta o pulo** (cai mais rápido).
- Agachado: hitbox mais baixa; animação de duck + corrida agachada.
- Animações: waiting (piscar), running, jumping, ducking, crashed.
- Um pulo por aperto (ignorar repeat de `keydown`).

### Obstáculos

- Cactos pequenos, grandes e grupos (1–3), com `minGap` / `multipleSpeed` do Chromium.
- Pterodáctilos quando `currentSpeed >= 8.5` (não por score 450); alturas `[100, 75, 50]` no desktop e `[100, 50]` no mobile.
- Gap: `minGap = width * speed + type.minGap * gapCoefficient`, `maxGap = minGap * 1.5`.
- Hitboxes: caixas múltiplas do Chromium (`CollisionBox`), não um único AABB frouxo.

### Cenário

- Linha do horizonte, chão com relevo que faz scroll, nuvens mais lentas que o chão.
- Score numérico no canto (dígitos estilo o original).
- HI persistente.
- Flash do score a cada 100 pontos (`ACHIEVEMENT_DISTANCE`).
- Modo noite quando a distância *exibida* é múltipla de 700 (`invertDistance`); dura `invertFadeDuration` 12000 ms e cicla. Inverte `#f7f7f7` ↔ `#535353` no canvas (não usa tema do SO).

### Progressão

Constantes do modo normal Chromium:

- `FPS` 60, `speed` 6, `acceleration` 0.001, `maxSpeed` 13, `clearTime` 3000, `gameoverClearTime` 1200
- T-Rex: `gravity` 0.6, `initialJumpVelocity` -10, `minJumpHeight`/`maxJumpHeight` 30, `speedDropCoefficient` 3, `dropVelocity` -5, tamanho 44×47 (duck 59×25)
- Score: `distanceRan * 0.025` arredondado; HUD com 5 dígitos e prefixo `HI`
- Game over: texto `GAME OVER` + ícone de restart (qualquer pulo/tap após `gameoverClearTime` reinicia)

## Fluxo por frame

1. Ler input acumulado do frame (teclado e toque).
2. Se WAITING e pulo: ir para RUNNING.
3. Se CRASHED e pulo/restart: resetar partida.
4. Atualizar T-Rex (física e animação).
5. Se RUNNING: avançar horizonte, spawn/mover obstáculos, colisão AABB, somar score a partir da distância, checar flash/noite, acelerar.
6. Desenhar fundo, horizonte, obstáculos, T-Rex, HUD de score/GAME OVER.
7. Delta time limitado (clamp) para aba em segundo plano não teletransportar o dino.

Toque: apenas o primeiro dedo. Tap (pouco movimento) = pulo. Swipe para baixo = agachar enquanto o dedo permanece. `preventDefault` no canvas para não rolar nem dar zoom.

HI: chave `aleatossauro-hi` no `localStorage` (valor = `distanceRan` em pixels). Ler no boot; gravar só no crash se `score > hi`. Falha de storage não interrompe o jogo (HI só na sessão).

## Erros e bordas

- Sem canvas 2D ou sem `requestAnimationFrame`: mensagem HTML visível (“Seu navegador não roda este jogo”) e nenhum loop.
- `localStorage` em `try/catch`.
- Resize e orientação: redimensionar canvas e escala; **não** resetar a partida.
- Vários dedos: ignorar além do primeiro.
- Repeat de tecla: ignorar.
- `visibilitychange` / delta alto: clamp do dt, não pause menu.

## Controles — mapa

| Ação | Desktop | Celular |
|------|---------|---------|
| Pular / começar / restart | Espaço, ArrowUp | Tap |
| Agachar / cortar pulo | ArrowDown | Swipe down (segurar = duck) |

## Validação (definição de pronto)

Sem runner de testes no MVP. Verificar no Chrome (desktop) e em viewport mobile (DevTools + aparelho se possível):

1. WAITING: dino pisca; primeiro pulo inicia a corrida.
2. Pulo e agachar (teclado e toque) com feeling próximo ao Chrome.
3. Cactos; pterodáctilos após o threshold; colisão encerra a partida.
4. Score sobe; HI persiste após F5; noite inverte cores após o threshold.
5. GAME OVER e restart por Espaço e por tap.
6. Canvas em tela cheia em janela larga, estreita e em rotação; sem scroll/zoom acidental.
7. Voltar de aba em background não atravessa obstáculos por um frame gigante.

Pronto = os 7 itens passam e o jogo é jogável do `index.html` sem servidor.

## Não fazer

- Copiar `offline-sprite-1x.png` / sprites oficiais do Chromium.
- Dependências npm, bundler, TypeScript.
- Som, vibração, gamepad, PWA.
- UI HTML de score, botões ou menu (tudo no canvas, salvo o fallback de browser incompatível).
