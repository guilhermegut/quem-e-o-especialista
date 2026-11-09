# Acessibilidade e desempenho (06/11/2026)

Auditoria automática com axe-core (regras WCAG 2 A e AA), por scripts/a11y.mjs, em menu, Como jogar, Sobre, escolha de nível, vinheta e nos estados de pergunta e revelação dos quatro módulos, nos modos claro e escuro: nenhuma violação depois de duas correções (texto secundário pequeno trocado de #86868B para #6E6E73, que dá 5,07:1 sobre branco e 4,66:1 sobre #F5F5F7; e papel ARIA na barra de progresso e no placar). A auditoria automática não substitui teste com leitor de tela, que continua pendente.

Lighthouse 12, perfil de celular com limitação simulada, no build de produção servido localmente:

| Rodada | Desempenho | Acessibilidade | Boas práticas | Tempo de bloqueio | Interativo |
|---|---|---|---|---|---|
| Antes | 70 | 100 | 96 | 1.110 ms | 3,9 s |
| Depois | 93 | 100 | 100 | 110 ms | 2,7 s |

O ganho veio de trocar o mapa de demonstração do menu pela escala 1:110m (160 KB em vez de 1,3 MB, e processamento muito menor) e de baixar o mapa 1:50m da partida só depois de 4 s ocioso no menu. O ícone da aba, que faltava (erro 404 no console), passou a ser um SVG embutido. O primeiro conteúdo aparece em 2,5 s, ainda dominado pelo pacote principal de 264 KB comprimido; dividi-lo é o próximo passo se a meta subir.
