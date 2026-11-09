# Pesquisa dos 100 conflitos

Lista aprovada pelo usuário em 06/11/2026 (aba "Lista de 100 conflitos" do documento de especificação), copiada em data/curated/ordem-100.json com o id de cada ficha.

## Método

Cada ficha é pesquisada em pelo menos duas fontes de boa qualidade (Wikipedia em inglês, Britannica, World History Encyclopedia; Wikipedia em português e fontes brasileiras para os conflitos do Brasil) e redigida para o jogo, sem copiar frases. Regras de redação: as quatro pistas (pano de fundo, envolvidos, estopim, desfecho) não têm datas nem o nome do conflito; a pista de envolvidos descreve os lados sem nomeá-los; nenhum número de mortos é perguntado. Participantes de Lados com lado ambíguo ficam de fora; os que mudaram de lado só entram com nota que explique a fase. Conflitos com mais de dois lados estáveis (por exemplo, Três Reinos ou Guerra Civil Síria) ficam sem Lados e aparecem só no Dossiê.

Fluxo: cada lote vai para data/curated/lotes/NN-nome.json; scripts/merge-conflitos.py junta tudo em src/data/conflitos.json na ordem da lista, e os testes de engine.test.ts validam pistas, fontes e lados.

## Situação

Prontos (100): lotes 01 a 10, com 59, 73 e 84 do piloto. Versão do acervo: acervo-1; versão de conteúdo do jogo: d4.

Com uma fonte só, a conferir na verificação independente: 8, 9, 14, 22, 30, 37, 39, 43, 46, 48, 61, 63, 70, 71, 75, 79 Guerra Civil Espanhola, 81 Segunda Guerra Mundial e 86 Guerra da Argélia; 33 tem a Britannica só para o nome Qing; 44 tem a World History só para o Bloqueio Continental. Fontes de apoio parciais (a segunda fonte cobre só parte da ficha): 36, 41, 56, 67, 69, 76, 93 (Britannica só para causas e invasão), 94 (Britannica só para a invasão e a reação da ONU) e 97 (Britannica sem o acordo de Doha nem o desfecho; o desfecho vem da Wikipedia em inglês e em português). Em 99 e 100, a Britannica não cobre a situação atual; a situação vem só da Wikipedia em inglês, consultada em 06/11/2026.

Sem Lados: 7, 9, 16, 24, 44, 65, 67, 69, 70 e 78 (um contra um); 88 Guerra Colonial Portuguesa e 89 Guerra dos Seis Dias (um país contra todos os demais, o que tornaria a rodada trivial); 95 Guerras Iugoslavas e 99 Guerra Civil Síria (mais de dois lados estáveis).

Escolhas que pedem atenção na verificação: em 87, União Soviética e China entram no lado do norte como apoiadoras, conforme as duas fontes; em 90, Estados Unidos e União Soviética entram como fornecedores de cada lado; em 91, 92, 93 e 97, os apoiadores externos citados pelas fontes entram com nota, e o Paquistão fica fora de Lados em 97 (a fonte diz que ajudou o Talibã, mas ele era também aliado formal dos Estados Unidos), constando só no dado; em 96, o Sudão fica fora porque nenhum dos trechos lidos o menciona, e o Chade entra com base só na Wikipedia em português; em 99, o período passou de "desde 2011", como estava na lista aprovada, para 2011–2024, porque a Wikipedia em inglês consultada em 06/11/2026 dá a guerra civil por encerrada com a queda de Assad; em 100, a guerra segue em curso segundo a mesma fonte.

Pendência resolvida em 09/11/2026: o Brasil entrou em Lados da Segunda Guerra Mundial, com fonte (Brazil in World War II).

## Verificação independente das guerras em jogo

As 22 fichas que entram no jogo (lista EM_JOGO em src/engine/conflitos.ts) foram conferidas em 09/11/2026 por verificadores que não escreveram o conteúdo, em três lotes: guerras-lote-1.md, guerras-lote-2.md e guerras-lote-3.md. As correções foram aplicadas no mesmo dia e estão registradas ao fim de cada relatório. As outras 78 fichas continuam no acervo, fora do jogo, sem verificação independente.
