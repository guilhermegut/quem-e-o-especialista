# Verificação independente de esportes.json (Quem é o Especialista)

Data: 10/11/2026

Escopo: data/curated/quiz/esportes.json, apenas nas partes indicadas: copa (1930 a 1994), copaFem (1991 e 1995), olimpiadas (sedes de 1980 a 1994), f1 (1980 a 1995), olimpMedalhas (1980 a 2024, com as notas), tenis (1990 a 2026, 294 linhas), nba (1985 a 2026), nfl (Super Bowls XXXIX a LX) e livres (45 perguntas). As demais partes (copa de 1998 a 2026, copaFem de 1999 a 2023, sedes olímpicas de 1996 em diante, f1 de 1996 em diante e bola) já tinham sido verificadas e ficaram fora desta conferência.

## Método

O arquivo foi lido com python3 -I, sem alteração. Cada parte foi conferida com WebFetch em páginas de lista da Wikipedia em inglês, pedindo a tabela inteira do período. Copa, F1, NBA, NFL e tênis foram comparados campo a campo por script contra o texto extraído; nos nomes do tênis, a comparação ignorou acentos, e a única diferença assim (Ana Ivanović contra Ana Ivanovic) é só de grafia. Os resultados de 2026 (Grand Slams, final da NBA e Super Bowl LX) foram confirmados em notícias por WebSearch. Nas perguntas livres, cada fato da resposta certa, das alternativas erradas e da explicação foi conferido na página citada em "fontes". Quando ela não cobria um ponto, usou-se uma fonte adicional, indicada abaixo. Nada foi dado como confirmado só com base em memória.

Limitações: o WebFetch entrega um resumo da página feito por outro modelo, e não o texto bruto, e pode servir uma versão em cache. Isso apareceu na List of Grand Slam men's singles champions, que veio com Wimbledon e US Open 2026 marcados como "Not yet played", embora a página feminina e as notícias já trouxessem os campeões. Esses dois títulos masculinos foram confirmados só em notícias. A List of Super Bowl champions não marca prorrogação, e as finais com prorrogação (LI e LVIII) foram confirmadas numa reportagem da NBC. A página Bill_Russell_NBA_Finals_Most_Valuable_Player veio sem as linhas da tabela, e os MVPs das finais foram conferidos na lista da Basketball-Reference.

## Páginas consultadas

Wikipedia (en): List of FIFA World Cup finals; FIFA Women's World Cup; List of Olympic Games host cities; List of Formula One World Drivers' Champions; Summer Olympic Games (coluna "top nation"); 2024 Summer Olympics medal table; 1992 Summer Olympics medal table; List of Grand Slam men's singles champions; List of Grand Slam women's singles champions; List of NBA champions; Bill Russell NBA Finals Most Valuable Player (sem a tabela); List of Super Bowl champions; Super Bowl Most Valuable Player; FIFA World Cup; List of FIFA World Cup top goalscorers; Pelé; 2014 FIFA World Cup final; Brazil v Germany (2014 FIFA World Cup); Marta (footballer); Ballon d'Or; 1980 Summer Olympics boycott; 1984 Summer Olympics boycott; Michael Phelps; Usain Bolt; Football at the 2016 Summer Olympics – Men's tournament; Brazil men's national volleyball team; Volleyball at the 1992 Summer Olympics – Men's tournament; Joaquim Cruz; Rebeca Andrade; Simone Biles; 2020 Summer Olympics; 2024 Summer Olympics opening ceremony; Mike Tyson; Mike Tyson vs. Buster Douglas; Evander Holyfield vs. Mike Tyson II; Larry Holmes vs. Muhammad Ali; Muhammad Ali; Michael Moorer vs. George Foreman; Floyd Mayweather Jr.; Floyd Mayweather Jr. vs. Manny Pacquiao; Floyd Mayweather Jr. vs. Manny Pacquiao II; Manny Pacquiao; Acelino Freitas; Robson Conceição; Hebert Conceição; Boxing at the 2016 Summer Olympics – Men's lightweight; Klitschko brothers; Wladimir Klitschko vs. Tyson Fury; Tyson Fury vs. Oleksandr Usyk; Canelo Álvarez; UFC 1; Royce Gracie; Anderson Silva; Khabib Nurmagomedov; Conor McGregor; Amanda Nunes; Holly Holm; José Aldo; Alex Pereira; Demetrious Johnson; Pride Fighting Championships; UFC 134.

Outras fontes: Basketball-Reference, NBA Finals MVP (basketball-reference.com/awards/finals_mvp.html); The Ring, anúncio da volta de Mayweather (20/02/2026); NBC Washington, "How many Super Bowls have gone to overtime"; National Herald, "22 goals, one record" (19/07/2026). Também foram usados títulos de notícias encontradas por WebSearch para os resultados de 2026, conferidos por manchete e data: Le360, Arab News e Sky Sports para Wimbledon; Al Jazeera e CP24 para o US Open masculino; OKC Fox e Arab News para o US Open feminino; Euronews, TSN e Luxus Magazine para Roland Garros; Kiwi Kids News e Doittennis para o Australian Open; Al Jazeera, UPI e News4Jax para a final da NBA; NFL.com, ESPN e CBS Sports para o MVP do Super Bowl LX; e Yahoo Sports, The Ring e Tapology para o adiamento de Mayweather contra Pacquiao II. Para o placar da final olímpica de 2016 serviram as manchetes do Irish Times ("Brazil 1 Germany 1 (aet; Brazil won 5-4 on penalties)") e da FIFA.

Fonte que não abriu: https://en.wikipedia.org/wiki/Mike_Tyson_vs._Trevor_Berbick (url_not_found), citada na pergunta livre 19.

## Contagem do que foi conferido

| Parte | Itens conferidos | Sem problema | Com problema |
|---|---|---|---|
| copa (1930 a 1994): sede, campeão, vice, placar | 15 edições | 15 | 0 |
| copaFem (1991, 1995): sede, campeão, vice | 2 edições | 2 | 0 |
| olimpiadas (1980 a 1994, verão e inverno): cidade, país | 9 sedes | 9 | 0 |
| f1 (1980 a 1995): piloto, país, equipe | 16 temporadas | 16 | 0 |
| olimpMedalhas (1980 a 2024): líder e notas | 12 edições e 3 notas | 12 e 3 | 0 |
| tenis (1990 a 2026): campeão | 294 linhas | 294 | 0 |
| nba (1985 a 2026): campeão, vice, MVP das finais | 42 temporadas | 42 | 0 |
| nfl (XXXIX a LX): campeão, vice, placar, MVP | 22 jogos | 22 | 0 |
| livres: certa, erradas, explicação, fonte | 45 perguntas | 40 | 5 |
| Total | 457 itens | 452 | 5 |

Observações sobre as partes sem problema. Na Copa de 1950, a página registra que não houve final em jogo único; o Uruguai 2 a 1 Brasil é tratado como final de fato, inclusive pela FIFA, o que confere com o texto "no jogo decisivo do quadrangular final". Nas finais com prorrogação (1934, 1966, 1978) e na de 1994 (0 a 0 e 3 a 2 nos pênaltis), a marcação do arquivo confere. No quadro de medalhas, a nota de 2024 confere (40 ouros cada; Estados Unidos com 44 pratas contra 27 da China). A nota de 1992 também está correta: a página diz que a Equipe Unificada reuniu atletas de 12 das 15 ex-repúblicas soviéticas. No tênis, Wimbledon 2020 consta como cancelado nas duas listas, e as oito conquistas de 2026 foram confirmadas em notícias: Alcaraz e Rybakina no Australian Open, Zverev (sobre Cobolli) e Mirra Andreeva em Roland Garros, Sinner (sobre Zverev) e Linda Nosková em Wimbledon, e Zverev (sobre Shelton) e Rybakina (sobre Sabalenka) no US Open. Na NBA, os Knicks venceram os Spurs por 4 a 1 em 2026, com Jalen Brunson MVP. No Super Bowl LX (08/02/2026), o Seattle venceu o New England por 29 a 13, com Kenneth Walker III MVP; os Super Bowls LI e LVIII foram de fato os dois decididos na prorrogação.

## Resultado geral

As oito partes de dados tabulares (copa, copaFem, olimpiadas, f1, olimpMedalhas, tenis, nba, nfl) conferem integralmente com as fontes. Nas 45 perguntas livres há um erro de conteúdo que exige correção (pergunta 1), três pontos de prioridade baixa (duas alternativas erradas que são em parte verdadeiras e uma explicação com superlativo que a fonte não sustenta) e uma fonte com URL quebrada. Há também uma ressalva sem ação necessária (pergunta 24).

## Problemas

1. livres, pergunta 1 ("Quem é o maior artilheiro da história das Copas do Mundo masculinas?"). Erro de conteúdo, prioridade alta. A resposta certa marcada é Miroslav Klose, com explicação de 16 gols. Pela List of FIFA World Cup top goalscorers, consultada em 10/11/2026, o recordista passou a ser Kylian Mbappé, com 22 gols (2018, 2022 e 2026); Lionel Messi, que aparece entre as alternativas erradas, tem 21, e Klose caiu para o terceiro lugar, com 16. O National Herald (19/07/2026) confirma: Mbappé fez 4 gols em 2018, 8 em 2022 e 10 em 2026, e superou os 21 de Messi. Recomendação: trocar a certa para "Kylian Mbappé", pôr Klose entre as erradas (Klose, Ronaldo, Messi) e reescrever a explicação com os números da fonte. Os valores estão em decisoes.json.

2. livres, pergunta 18 ("Onde foi a cerimônia de abertura dos Jogos de Paris 2024?"). Prioridade baixa. A certa ("No rio Sena") e a explicação estão corretas; a página diz que foi a primeira abertura fora de um estádio na história olímpica moderna. Mas a alternativa errada "Na Torre Eiffel" é em parte verdadeira: a torre teve números artísticos e a cerimônia terminou com Céline Dion cantando no primeiro andar dela. Recomendação: trocar essa alternativa por um local que não tenha participado da cerimônia.

3. livres, pergunta 19 (Tyson contra Berbick). Problema de fonte. O conteúdo está correto: pela página Mike Tyson, ele venceu Berbick em 22/11/1986, ganhou o título do CMB aos 20 anos e virou "the youngest heavyweight champion in history". A URL citada, porém, não abriu (url_not_found). Recomendação: substituir a fonte pela página Mike Tyson.

4. livres, pergunta 41 ("Em que esporte Alex Poatan Pereira se destacou antes de ser campeão do UFC?"). Prioridade baixa. A certa (kickboxing) e a explicação estão corretas: ele foi campeão dos médios e dos meio-pesados do Glory e venceu Adesanya duas vezes no kickboxing, em 2016 e 2017. A mesma página, porém, registra uma carreira de boxe amador no Brasil (25 vitórias por nocaute e 3 derrotas), o que deixa a alternativa errada "Boxe olímpico" em parte verdadeira. Recomendação: trocar essa alternativa.

5. livres, pergunta 43 (Pride). Prioridade baixa. A certa está correta: Wanderlei Silva foi o primeiro campeão dos médios do Pride e Nogueira, o primeiro dos pesados. A explicação, porém, diz que o Pride "foi o maior evento de MMA do mundo no início dos anos 2000", e a fonte citada só sustenta "one of the most popular MMA organizations in the world" nos dez anos de existência. Recomendação: usar o texto proposto em decisoes.json, que se limita ao que a página afirma.

## Ressalva sem ação necessária

livres, pergunta 24 (Mayweather, 50 vitórias). Hoje a pergunta está correta: a página Floyd Mayweather Jr. registra 50 a 0 e nenhuma luta profissional depois de McGregor em 2017. Em 20/02/2026, porém, Mayweather anunciou a volta ao boxe profissional (The Ring), e a revanche com Pacquiao, prevista para setembro de 2026 e anunciada como luta oficial, foi adiada sem data em 25/06/2026 (Floyd Mayweather Jr. vs. Manny Pacquiao II). A frase "encerrou a carreira" da explicação pode envelhecer. Se a luta acontecer, a pergunta precisa ser revista.

## Correções aplicadas (10/11/2026)

Aplicadas as 7 entradas de decisoes.json em data/curated/quiz/esportes.json: a pergunta 1 passa a ter Kylian Mbappé como certa, com Klose, Ronaldo e Messi entre as erradas e a explicação nova; a fonte da 19 passa à página Mike Tyson; a explicação da 43 fica restrita ao que a fonte diz. Nas perguntas 18 e 41, em que a verificação não propôs substituto, as alternativas erradas em parte verdadeiras foram trocadas por opções obviamente falsas: "No Parc des Princes" (a fonte diz que a abertura foi a primeira fora de um estádio) e "Esgrima". A ressalva da 24 (Mayweather) fica registrada para revisão se a luta acontecer.
