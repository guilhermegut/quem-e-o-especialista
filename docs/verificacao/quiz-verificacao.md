# Verificação independente do conteúdo do quiz "Quem é o Especialista"

Data: 09/11/2026

Escopo: data/curated/quiz/lideres.json, esportes.json, filosofia.json e arte.json.

Método: cada item foi conferido contra as URLs do seu campo "fontes", lidas com WebFetch em 09/11/2026, com perguntas restritas aos dados do item. Quando a fonte listada não cobria um ponto, consultou-se uma única fonte adicional (Wikipedia em inglês), indicada abaixo; nada foi dado como confirmado com base em memória.

Limitação: o WebFetch lê a versão da página que o serviço entrega, que pode estar em cache. Na página do Reino Unido, o tempo de mandato exibido para Andy Burnham ("70 days") corresponde a um retrato de cerca de 28/09/2026; mudanças posteriores em qualquer página não seriam captadas. Nenhum host falhou ou recusou acesso.

## lideres.json

148 mandatos conferidos em 20 listas (19 países, Turquia em duas). Nomes, ordem e datas de início e fim batem com as fontes em todos os mandatos de 1996 em diante, inclusive as mudanças de 2025 e 2026: Canadá (Carney desde 14/03/2025), Alemanha (Merz desde 06/05/2025), Japão (Ishiba até 21/10/2025, Takaichi desde então), Coreia do Sul (Yoon até 04/04/2025, interinos Han Duck-soo, Choi Sang-mok, Han Duck-soo e Lee Ju-ho com as datas da fonte, Lee Jae-myung desde 04/06/2025) e Reino Unido (Starmer até 20/07/2026, Andy Burnham desde 20/07/2026, marcado como incumbente na fonte).

### Divergências

1. Argentina, Adolfo Rodríguez Saá (23/12/2001–30/12/2001). No arquivo: marcado "interino": true. Na fonte: "Elected by the Congress for three months, with instructions to call for elections", mesma natureza de Eduardo Duhalde ("Elected by Congress"), que no arquivo não é interino; a fonte só trata como exercício provisório Ramón Puerta e Eduardo Camaño ("exercising the Executive Power"). Correção proposta: retirar "interino" de Rodríguez Saá, ou, se o critério do jogo for "não eleito pelo voto popular", marcar também Duhalde e registrar o critério na "_nota".

2. Argentina, omissão de Federico Pinedo. A fonte lista Pinedo em 10/12/2015 (até as 11h45, "Provisional President of the Senate exercising the Executive Power"), entre Cristina Kirchner e Macri. O arquivo não o inclui. Correção proposta: acrescentar como interino de 10/12/2015 a 10/12/2015, ou registrar a omissão na "_nota". Impacto prático nulo, porque nenhuma data inteira cai nesse intervalo.

3. Indonésia, Suharto. No arquivo: mandato único de 12/03/1967 a 21/05/1998, sem marcação. Na fonte: presidente interino (acting) de 12/03/1967 a 27/03/1968 e efetivo de 27/03/1968 a 21/05/1998. Correção proposta: dividir em dois mandatos, o primeiro com "interino": true, por coerência com o tratamento dado a Putin em 1999–2000. Baixo impacto, pois o período fica fora da janela de 1996 em diante.

### Não verificáveis

1. Arábia Saudita, início do reinado de Fahd (13/06/1982): a fonte não informa a data; só indica 13/06/1982 como fim do reinado de Khalid. A própria "_nota" do arquivo já registra isso.

2. Arábia Saudita, início do reinado de Abdullah (01/08/2005): a fonte não declara a data de início; ela é apenas inferível do fim do reinado de Fahd (01/08/2005), que a fonte informa.

## esportes.json

95 itens conferidos: 8 finais da Copa masculina, 7 da feminina, 20 sedes olímpicas, 30 campeões da Fórmula 1 e 30 da Bola de Ouro, além das três afirmações da "_nota" (sem Bola de Ouro em 2020; temporada 2026 da F1 em andamento, com a página atualizada até o GP da Cidade do México; nome "FIFA Ballon d'Or" de 2010 a 2015), todas confirmadas. A final de 2026 (Espanha 1 a 0 na Argentina, na prorrogação, sede Canadá, Estados Unidos e México) confere com as duas fontes listadas. A sede de 2002 não é coberta pela lista de finais, que só traz o local da final (Japão); a fonte adicional "2002 FIFA World Cup" (Wikipedia em inglês) confirma a coorganização por Coreia do Sul e Japão.

### Divergências

1. Jogos de Inverno de 2034. No arquivo: cidade "Salt Lake City". Na fonte listada: sede registrada como "Utah". A fonte adicional "2034 Winter Olympics" (Wikipedia em inglês) informa que a designação oficial passou a ser "Utah 2034" em novembro de 2025, depois de a candidatura ter sido aprovada como "Salt Lake City–Utah 2034". Correção proposta: cidade "Utah" (ou "Salt Lake City–Utah"), com nota sobre a mudança de nome; o país, Estados Unidos, está correto.

### Não verificáveis

Nenhum.

## filosofia.json

24 itens conferidos: 18 filósofos (origem, época, obras, conceito, frase e extra) e 6 perguntas livres (resposta certa, explicação e alternativas erradas). Observações sem divergência: a fonte de Agostinho não usa a expressão "Antiguidade tardia", mas situa-o em 354–430, na era patrística, o que é compatível; a de Tomás de Aquino não diz "Idade Média" textualmente, mas dá 1225–1274 e contexto medieval; a de Confúcio traz datas internamente inconsistentes (552/551 a 489/479 a.C.), o que não afeta o item, que não usa datas.

As alternativas erradas foram confirmadas assim. Mestre de Aristóteles: Confúcio (551–479 a.C.), Sêneca (c. 4 a.C.–65 d.C.) e Tomás de Aquino (1225–1274) são incompatíveis com Aristóteles (384–322 a.C., discípulo de Platão na Academia), pelas datas das fontes lidas. Dedicatória de O Príncipe: a fonte indica Lourenço II de Médici como dedicatário, o que exclui Cosme de Médici, César Bórgia e Carlos V. Coautor do Manifesto: a fonte atribui a redação à dupla Marx e Engels, o que exclui Nietzsche, Weber e Hegel. Prêmio recusado por Sartre em 1964: a fonte identifica o Nobel de Literatura, o que exclui Nobel da Paz, Pulitzer e Goncourt. Imperador tutelado por Sêneca: a fonte registra apenas Nero (a partir de 49 d.C.) e Sêneca morto em 65 d.C.; a fonte adicional "List of Roman emperors" (Wikipedia em inglês) dá Augusto em 27 a.C.–14 d.C. (reinado iniciado antes do nascimento de Sêneca), Marco Aurélio em 161–180 e Constantino em 306–337, o que exclui os três. Preceptor de Aristóteles: Nero fica excluído pelas fontes (Aristóteles morreu em 322 a.C.; Nero foi tutelado por Sêneca a partir de 49 d.C.).

### Divergências

Nenhuma.

### Não verificáveis

1. Pergunta "Aristóteles foi preceptor de qual futuro governante?": as alternativas erradas "Júlio César" e "Carlos Magno" não têm datas em nenhuma fonte lida, e a página de Aristóteles não as menciona. O anacronismo é evidente, mas não foi confirmado por fonte. A resposta certa (Alexandre, o Grande) está confirmada.

## arte.json

18 obras conferidas (autor, ano, local, cidade, movimento e extra). A localização de O Nascimento de Vênus na Galeria Uffizi não aparece no texto da fonte listada (que só fala em "exposta em Florença"); a fonte adicional "The Birth of Venus" (Wikipedia em inglês) confirma a Uffizi, em Florença, e data a obra de c. 1484–86, compatível com "c. 1485". Observações sem divergência: A Ronda Noturna pertence ao Amsterdam Museum, mas está exposta no Rijksmuseum, como diz o arquivo; Guerra e Paz está com "ano": null, e a fonte informa 1953–1956, dado que pode ser preenchido se útil.

### Divergências

1. O Grito. No arquivo: local "Galeria Nacional", Oslo. Na fonte listada (pt): o texto diz que o original de 1893 está na "Galeria Nacional de Oslo", mas a legenda da mesma página atribui a versão mais conhecida ao "Museu Nacional de Arte, Arquitetura e Design", em Oslo, sem explicar a relação entre os dois. A fonte adicional "The Scream" (Wikipedia em inglês) diz: "It is in the collection of the National Museum of Norway in Oslo", e cita a Galeria Nacional apenas no contexto do furto de 1994. Correção proposta: local "Museu Nacional da Noruega"; cidade Oslo e demais campos estão corretos.

### Não verificáveis

Nenhum.

## Resumo

| Arquivo | Itens conferidos | Divergentes | Não verificáveis |
|---|---|---|---|
| lideres.json | 148 mandatos | 2, mais 1 omissão | 2 |
| esportes.json | 95 | 1 | 0 |
| filosofia.json | 24 | 0 | 1 |
| arte.json | 18 | 1 | 0 |
| Total | 285 | 4, mais 1 omissão | 3 |

As divergências são de baixo impacto para o jogo: marcação de interino na Argentina (Rodríguez Saá) e na Indonésia (Suharto, fora da janela de 1996), designação da sede de Inverno de 2034 ("Utah") e museu de O Grito ("Museu Nacional da Noruega"). A omissão é Federico Pinedo (Argentina, 10/12/2015, por horas). Nenhum campeão, placar, sede de Copa, chefe de governo atual, autoria, frase ou alternativa errada foi encontrado incorreto. Fontes adicionais usadas: 2002 FIFA World Cup, 2034 Winter Olympics, List of Roman emperors, The Birth of Venus e The Scream, todas da Wikipedia em inglês, uma por ponto não coberto.

## Correções aplicadas em 09/11/2026

O Grito passou a constar no Museu Nacional da Noruega, em Oslo, com a Wikipedia em inglês como segunda fonte. Os Jogos de Inverno de 2034 saíram do acervo, porque o nome oficial passou a ser Utah 2034 e a pergunta se confundiria com Salt Lake City 2002. Em lideres.json, a nota passou a explicar que a marcação de interino serve para tirar das perguntas mandatos de poucos dias (caso de Rodríguez Saá, escolhido pela Assembleia Legislativa), que Federico Pinedo não consta e que o mandato de Suharto inclui o período interino anterior a 1996. Nenhuma dessas três ressalvas muda uma pergunta do jogo.
