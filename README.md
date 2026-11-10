# Quem é o Especialista

Jogo web diário em português do Brasil. Cada dia traz o mesmo desafio para todos os jogadores, com seis módulos de três rodadas: Mapa, Bandeiras, Mundo hoje (moedas, líderes do G20 e religiões), Cultura (esporte, filosofia, arte e cultura pop), Foto (em que ano a foto foi tirada) e Guerras. O Foto entrou em 11/11/2026; até ali eram cinco módulos. Quem faz 60% dos pontos no Nível Estagiário desbloqueia o Nível Prime do dia, que começa em seguida. Cada nível leva no máximo cerca de cinco minutos.

Também há duelo por link ou código (o amigo joga as mesmas rodadas e vê o placar rodada a rodada), treino livre por módulo, tema claro e escuro, narração com a voz do autor e animações feitas com Remotion. Tudo roda no navegador: não há servidor, cookies nem coleta de dados; o histórico fica no armazenamento local do navegador.

## Rodar

```
npm install
npm run dev       # servidor local
npm test          # testes do motor (Vitest)
npm run build     # site estático em dist/
PREVIEW=1 npx vite build   # um único HTML autocontido em dist-preview/
```

Os dados prontos ficam em `src/data/` e já vêm no repositório. Para gerá-los de novo a partir das fontes: `npm run data`, `node scripts/build-history.mjs` e `node scripts/build-quiz.mjs`.

## Publicação

O workflow `.github/workflows/pages.yml` roda os testes, gera o site e publica no GitHub Pages a cada push na branch `main`. No repositório, em Settings → Pages, a origem deve ser "GitHub Actions".

## Ranking

O ranking público (do dia, da semana e geral) usa um projeto Supabase. Não há login: o jogador escolhe um apelido e recebe um ID e um token aleatórios, guardados só no navegador; o banco guarda o hash do token. As tabelas ficam no esquema `ranking`, fora da API pública, e o site só usa as funções `qe_*`, que conferem data, nível, limites de pontuação e de duração e aceitam só a primeira tentativa do dia. O banco está em `supabase/migrations/`. O build lê `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` (chave publicável) e `VITE_RANKING_HOST` (o ranking só aparece nesse endereço); sem elas, o ranking fica escondido.

## Narração

As falas ficam em `src/voz/` com o nome `NN-id.mp3` (por exemplo `01-abertura.mp3`). O jogo carrega o que encontrar ali; sem arquivos, a opção de narração avisa que as gravações não estão incluídas.

## Estrutura

```
src/engine/        sorteio diário, níveis, pontuação, quiz, duelo, armazenamento local
src/modules/       rodadas de mapa, bandeiras, quiz e guerras
src/anim/          composições Remotion (abertura, vinhetas, celebração, placar)
src/app/           telas, partida, retomada após recarregar, resultado, voz
src/data/          JSON gerado pelos scripts (não editar à mão)
data/curated/      listas revisadas (líderes, esportes, filosofia, arte, cultura pop, guerras)
scripts/           geração de dados e testes no navegador (Chrome headless)
docs/verificacao/  fontes, licenças, verificações independentes e correções
```

## Dados e licenças

Natural Earth via world-atlas (domínio público; pacote ISC), GeoNames via all-the-cities (CC BY 4.0), world-countries (ODbL 1.0), Unicode CLDR (Unicode License v3), CIA World Factbook (domínio público), flag-icons (MIT), fonte Inter (SIL OFL 1.1). Líderes, esportes, filosofia, arte, cultura pop e guerras foram escritos pelo projeto a partir de Wikipedia, Britannica e outras fontes citadas em cada pergunta. Detalhes em `docs/verificacao/`.

Remotion é usado sob a licença gratuita para pessoas físicas. Se o projeto passar a ser de uma empresa com 4 ou mais pessoas, essa licença deixa de valer.
