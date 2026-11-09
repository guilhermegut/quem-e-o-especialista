# Verificação independente das fichas de guerras, lote 3

Data da consulta: 09/11/2026.

Escopo: as 7 fichas de src/data/conflitos.json (primeira-guerra-mundial, guerra-civil-espanhola, primeira-guerra-arabe-israelense, guerra-dos-seis-dias, guerra-ira-iraque, guerras-iugoslavas, guerra-civil-siria). Os arquivos do projeto não foram alterados.

Método: cada afirmação (período, as quatro pistas, dado, cada participante de Lados e sua nota) foi conferida contra as URLs do campo "fontes", lidas com WebFetch em 09/11/2026. Quando a fonte listada não cobria um ponto ou falhou, usou-se uma fonte adicional, indicada na tabela. Também se conferiram as regras de redação: pistas sem datas e sem o nome do conflito; pista "envolvidos" sem nomear os lados; nenhum número de mortos perguntado (o "dado" só aparece depois da resposta, em ConflictRoundView.tsx, linhas 135 e 239, e por isso pode trazer números de mortos); em Lados, ninguém no lado errado nem com lado ambíguo sem nota.

Limitações: o WebFetch lê a versão da página que o serviço entrega, possivelmente em cache, e páginas longas foram lidas em partes. Falharam: Britannica, Spanish Civil War (erro do site, duas tentativas); NBC News e Enab Baladi (recusa do site), substituídas por outras fontes. O acesso direto à Wikipedia por linha de comando foi bloqueado pelo proxy; tudo foi lido via WebFetch. A página da Britannica sobre a guerra síria, na parte lida, cobre só o início do conflito (até 2011) e traz a linha de data "February 2011 - present".

Legenda dos resultados: correto; incorreto; impreciso (verdadeiro em essência, mas com erro de detalhe, exagero ou omissão relevante); desatualizado; fora da regra (fere regra de redação); não confirmado.

## 1. Primeira Guerra Mundial (primeira-guerra-mundial)

Fontes: [B] https://www.britannica.com/summary/Causes-and-Effects-of-World-War-I · [W] https://en.wikipedia.org/wiki/World_War_I · [BR] https://en.wikipedia.org/wiki/Brazil_during_World_War_I · adicionais: [RO] https://en.wikipedia.org/wiki/Romania_in_World_War_I · [AH] https://en.wikipedia.org/wiki/Austria-Hungary

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1914–1918 | correto ("28 July 1914 – 11 November 1918") | W | — |
| Fundo: duas alianças armadas | correto (Tríplice Aliança e Tríplice Entente) | W, B | — |
| Fundo: França queria a Alsácia-Lorena de volta | correto ("desire for revenge by the French") | B, W | — |
| Fundo: nacionalismo sérvio desafiava "um império multiétnico nos Bálcãs" | impreciso: a Áustria-Hungria era "a multi-national empire in Central Europe", com domínios nos Bálcãs (Bósnia anexada em 1908), não um império dos Bálcãs | AH, W, B | "Duas alianças armadas dividiam as grandes potências europeias, a França queria de volta a Alsácia-Lorena, tomada pela Alemanha, e o nacionalismo sérvio desafiava nos Bálcãs um império multiétnico da Europa Central." |
| Envolvidos: França e Reino Unido, Rússia; Itália (antigo aliado do outro lado) e EUA; Alemanha e Áustria-Hungria, Império Otomano, Bulgária | correto quanto aos que cita; não nomeia ninguém | W, B | — |
| Envolvidos: omissão da Sérvia | impreciso: a Sérvia, alvo da primeira declaração de guerra e membro de Lados, não aparece; o único "reino balcânico" citado é o do lado oposto, o que pode confundir | W | "Duas potências da Europa Ocidental, um império eslavo e um pequeno reino balcânico, reforçados depois por um antigo aliado do lado oposto e por uma potência americana, contra dois impérios da Europa Central, aliados a um império que dominava boa parte do Oriente Médio e a outro reino balcânico." |
| Estopim: nacionalista sérvio-bósnio matou em Sarajevo o herdeiro do trono austro-húngaro | correto ("Gavrilo Princip, a Bosnian Serb"; "the heir to the Austro-Hungarian throne") | W, B | — |
| Estopim: um mês depois, Viena declarou guerra à Sérvia | correto (28/06 e 28/07/1914) | B, W | — |
| Estopim: em uma semana a maior parte da Europa estava em guerra | correto ("Within a week most of Europe was at war") | B | — |
| Desfecho: terminou com um armistício e com o Tratado de Versalhes | impreciso: o armistício de 11/11/1918 encerrou os combates com a Alemanha, e Versalhes foi o tratado "with Germany"; houve outros armistícios e tratados com as demais Potências Centrais | W, B | "Terminou com armistícios e tratados de paz, entre eles o de Versalhes. Os impérios alemão, austro-húngaro, otomano e russo deixaram de existir." |
| Desfecho: quatro impérios deixaram de existir | correto ("In the aftermath of the war, the German, Austro-Hungarian, Ottoman, and Russian empires had disappeared"; a Britannica fala em quatro dinastias) | W, B | — |
| Dado: até 8,5 milhões de soldados e cerca de 13 milhões de civis, segundo a Britannica | correto, conforme atribuído ("As many as 8.5 million soldiers and some 13 million civilians"). Observação: a Wikipedia dá 15 a 22 milhões de mortos no total, e a soma da Britannica (21,5 milhões) fica no topo dessa faixa; a atribuição à Britannica deve ser mantida | B, W | — |
| Lado A: França | correto | W | — |
| Lado A: Reino Unido, nota "Entrou em agosto de 1914, depois que a Alemanha invadiu a Bélgica" | correto | W | — |
| Lado A: Rússia, nota "Saiu em março de 1918, com Brest-Litovsk" | correto (3 de março de 1918) | W | — |
| Lado A: Sérvia | correto | W, B | — |
| Lado A: Itália, nota sobre a Tríplice Aliança e o Tratado de Londres de 1915 | correto, com imprecisão: em 1915 a Itália declarou guerra só à Áustria-Hungria; à Alemanha, "fifteen months later" (agosto de 1916) | W | "Antes da guerra integrava a Tríplice Aliança com Alemanha e Áustria-Hungria; pelo Tratado de Londres, entrou em 1915 contra a Áustria-Hungria e, em 1916, contra a Alemanha." |
| Lado A: Estados Unidos, nota "Entrou em 1917" | correto (abril de 1917) | W | — |
| Lado A: Brasil, nota de 26/10/1917 e ataques de submarinos | correto ("October 26, 1917: Brazil declared war on the Central Powers"; afundamento de navios mercantes por submarinos alemães) | BR | — |
| Lado A: Romênia, nota "Entrou em agosto de 1916" | impreciso (incompleto): assinou paz em separado com as Potências Centrais (Tratado de Bucareste, maio de 1918) e voltou à guerra em 10/11/1918; a Rússia tem nota de saída e a Romênia não | RO | "Entrou em agosto de 1916; fez paz em separado em maio de 1918 e voltou à guerra pelos Aliados em 10 de novembro de 1918." |
| Lado B: Alemanha | correto | W | — |
| Lado B: Áustria-Hungria | correto | W | — |
| Lado B: Império Otomano, nota "Entrou em novembro de 1914" | correto conforme a introdução ("joined the Central Powers in November"); o corpo da mesma página diz "Turkey became a member in September" (aliança), sem afetar a nota | W | — |
| Lado B: Bulgária, nota "Entrou em outubro de 1915, atacando a Sérvia" | correto ("Bulgaria declared war on Serbia on 14 October 1915") | W | — |
| Regras de redação | sem datas nem nome do conflito nas pistas; envolvidos sem nomes; ninguém no lado errado | — | — |

## 2. Guerra Civil Espanhola (guerra-civil-espanhola)

Fontes: [W] https://en.wikipedia.org/wiki/Spanish_Civil_War · adicionais: [PT] https://pt.wikipedia.org/wiki/Guerra_Civil_Espanhola · [SP] https://spartacus-educational.com/SPcasualties.htm. A Britannica (https://www.britannica.com/event/Spanish-Civil-War) falhou duas vezes; a ficha continua com uma fonte só no campo "fontes".

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1936–1939 | correto ("17 July 1936 – 1 April 1939") | W, PT | — |
| Fundo: república "recém-proclamada" | impreciso: a Segunda República foi proclamada em 1931, cinco anos antes da guerra ("remained in place for five years") | W, PT | "Uma república jovem estava profundamente polarizada, e uma frente de esquerda venceu por pouco as eleições." |
| Fundo: polarização; frente de esquerda venceu por pouco | correto ("The left-wing Popular Front narrowly won the 1936 general election"; 4.645.116 contra 4.503.524 votos) | W, PT | — |
| Envolvidos: "Os defensores da república, com ajuda soviética e mexicana..." | fora da regra: "soviética e mexicana" nomeia diretamente dois participantes de Lados, e "defensores da república" praticamente repete o nome do lado (Republicanos). Os fatos estão corretos ("Only two countries openly and fully supported the Republic: the Mexican government and the USSR") | W | "Os defensores do governo eleito, com armas de uma superpotência comunista e de um país latino-americano e com voluntários estrangeiros, contra generais rebelados e seus aliados, apoiados por dois regimes fascistas europeus e por um país vizinho." |
| Envolvidos: dois regimes fascistas apoiaram os rebeldes | correto ("munitions, soldiers, and air support from Fascist Italy and Nazi Germany") | W, PT | — |
| Envolvidos: omissão de Portugal | omissão (não é erro): Portugal "supplied the Nationalists with critical ammunition and logistical resources" e autorizou recrutamento de voluntários; a sugestão acima já o inclui como "um país vizinho" | W, PT | Opcional em Lados B: "Portugal", nota "Forneceu munições e apoio logístico aos nacionalistas." |
| Estopim: golpe de generais fracassou em parte e dividiu o país | correto ("partial failure of the coup d'état of July 1936", "leaving Spain militarily and politically divided") | W, PT | — |
| Desfecho: bombardeio de Guernica | correto | W | — |
| Desfecho: acordo de não intervenção que três potências ignoraram | correto ("Germany, Italy and the Soviet Union signed on officially, but ignored the embargo") | W | — |
| Desfecho: rebeldes venceram e o chefe governou por mais de três décadas | correto (vitória no início de 1939; governo até a morte de Franco, em novembro de 1975) | W, PT | — |
| Dado: "cerca de 110 mil combatentes nacionalistas e 90 mil republicanos" | incorreto (invertido): na infobox, 110 mil mortos em ação estão na coluna dos republicanos e 90 mil na dos nacionalistas; a Spartacus confirma: "110,000 fought for the Republicans and 90,000 for the Nationalists" | W, SP | ver abaixo |
| Dado: "dezenas de milhares de civis em cada zona" | impreciso: a infobox dá 50 mil a 200 mil civis mortos na zona nacionalista e 38 mil a 110.965 na republicana; o teto chega a centenas de milhares | W | "Morreram cerca de 110 mil combatentes republicanos e 90 mil nacionalistas, além de dezenas a centenas de milhares de civis nas duas zonas, conforme as estimativas." |
| Lado A: Segunda República Espanhola | correto | W | — |
| Lado A: Brigadas Internacionais, nota "Voluntários estrangeiros" | correto | W, PT | — |
| Lado A: União Soviética | correto | W, PT | — |
| Lado A: México | correto | W, PT | — |
| Lado B: Francisco Franco | correto | W | — |
| Lado B: Itália fascista | correto | W, PT | — |
| Lado B: Alemanha nazista, nota "Teve participação no bombardeio de Guernica" | correto; pode ser mais precisa: o ataque foi "carried out mainly by the Luftwaffe volunteers of the Condor Legion", com aviadores italianos | W | Opcional: "Enviou a Legião Condor, principal autora do bombardeio de Guernica." |
| Lados: França | corretamente fora: a infobox a lista como "France (Limited)" do lado republicano, mas assinou a não intervenção | W | — |

## 3. Primeira Guerra Árabe-Israelense (primeira-guerra-arabe-israelense)

Fontes: [W] https://en.wikipedia.org/wiki/1948_Arab%E2%80%93Israeli_War · [B] https://www.britannica.com/event/1948-Arab-Israeli-War · adicionais: [ALA] https://en.wikipedia.org/wiki/Arab_Liberation_Army · [JA] https://en.wikipedia.org/wiki/Jordanian_annexation_of_the_West_Bank

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1948–1949 | correto (15/05/1948 a 10/03/1949 na W; 15/05/1948 a 20/07/1949 na B) | W, B | — |
| Fundo: fim do mandato britânico, plano de partilha da ONU rejeitado pelos árabes, guerra civil prévia | correto ("The Arab League had unanimously rejected the UN partition plan"; "a full-scale civil war") | W, B | — |
| Envolvidos: "cinco Estados árabes vizinhos" | impreciso: os cinco eram Egito, Transjordânia, Síria, Líbano e Iraque, mas o Iraque não fazia fronteira ("Israel and Iraq, which do not share a border") | W, B | "Um Estado recém-declarado contra cinco Estados árabes, quatro deles vizinhos, e um exército de voluntários árabes." |
| Envolvidos: exército de voluntários árabes | correto ("an army of volunteers from Arab countries") | ALA | — |
| Estopim: com o fim do mandato, os Estados árabes invadiram | correto ("when the British mandate came to an end", tropas árabes entraram na Palestina) | B, W | — |
| Desfecho: o novo Estado venceu; armistícios fixaram fronteiras de fato | correto ("Israeli victory"; armistícios "established de facto borders") | W, B | — |
| Desfecho: "a Transjordânia anexou a Cisjordânia" | impreciso: a Transjordânia ocupou a Cisjordânia na guerra; a anexação formal foi em 24/04/1950, já como Jordânia (nome adotado em 26/04/1949) | JA, B | "O novo Estado venceu, e armistícios fixaram fronteiras de fato; a Transjordânia ocupou e depois anexou a Cisjordânia, e o Egito ocupou a Faixa de Gaza. Centenas de milhares de árabes palestinos fugiram ou foram expulsos." |
| Desfecho: Egito ocupou Gaza; centenas de milhares fugiram ou foram expulsos | correto | W, B | — |
| Dado: mais de 600 mil deslocados; Nakba; segundo a Britannica | correto, com ressalva: a Britannica diz "more than 600,000 and likely exceeded 700,000" e que "for Arabs, the war is remembered as 'the Nakba'" | B | Opcional: "Mais de 600 mil árabes palestinos, provavelmente mais de 700 mil, foram deslocados; os árabes lembram a guerra como Nakba, a catástrofe, segundo a Britannica." |
| Lado A: Israel | correto | W, B | — |
| Lado B: Egito, Transjordânia, Síria | corretos | W, B | — |
| Lado B: Iraque, nota "Nunca assinou armistício" | correto ("Israel and Iraq ... never signed an armistice agreement") | B | — |
| Lado B: Líbano, sem nota | correto quanto ao lado; participação limitada: o Líbano "decided not to take part in the war at the last minute" e fez "the only intervention of the Lebanese Army" (Malkiyya); a B o inclui entre os invasores | W, B | Opcional, nota: "Participou pouco: seu exército fez uma única ofensiva." |
| Lado B: Exército de Libertação Árabe, nota "Força de voluntários árabes" | correto (criado pela Liga Árabe, "fought on the Arab side") | ALA | — |
| Regras de redação | sem datas nem nome; "cinco Estados árabes" coincide com o nome do lado B, mas é descrição genérica e não identifica o conflito | — | — |

## 4. Guerra dos Seis Dias (guerra-dos-seis-dias)

Fontes: [W] https://en.wikipedia.org/wiki/Six-Day_War · [B] https://www.britannica.com/event/Six-Day-War

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1967 | correto (5 a 10 de junho de 1967) | W, B | — |
| Fundo: ataques de guerrilheiros palestinos e represálias israelenses | correto ("attacks ... had increased, leading to costly Israeli reprisals") | B, W | — |
| Fundo: dois vizinhos árabes de Israel firmaram pacto de defesa | correto (Síria e Egito, novembro de 1966; a Jordânia firmou outro com o Egito em 30 de maio de 1967) | W, B | — |
| Envolvidos: Estado judeu contra três vizinhos árabes, com tropas de um quarto país estacionadas num deles | correto como simplificação: Egito, Síria e Jordânia, e tropas iraquianas na Jordânia; a W fala em "a coalition of six Arab states", com aviões de Líbia, Argélia, Marrocos, Kuwait e Arábia Saudita | W, B | — |
| Estopim: país árabe "fechou um estreito à navegação" | impreciso: o fechamento foi "to Israeli shipping" | W, B | "Um país árabe fechou um estreito à navegação israelense, expulsou uma força de paz da ONU e concentrou tropas num deserto fronteiriço; Israel respondeu com ataques aéreos de surpresa que destruíram a maior parte da aviação adversária." |
| Estopim: expulsão da força da ONU; tropas no Sinai | correto (UNEF, 18 e 19 de maio; mobilização no Sinai, 14 de maio) | W, B | — |
| Estopim: ataques aéreos de surpresa destruíram a maior parte da aviação adversária | correto ("destroyed more than 90 percent Egypt's air force on the tarmac"; outras forças aéreas atingidas no mesmo dia) | B, W | — |
| Desfecho: península, faixa costeira, margem oeste do rio com a parte oriental da cidade sagrada, planalto ao norte; cessar-fogos | correto (Sinai, Gaza, Cisjordânia com Jerusalém Oriental, Golã; cessar-fogos de 8 a 10 de junho, assinados em 11 de junho) | W, B | — |
| Dado: Israel passou a controlar Sinai, Gaza, Cisjordânia com Jerusalém Oriental e Golã | correto; observação: repete o conteúdo do desfecho, o que não é erro, pois o dado só aparece depois da resposta | W, B | — |
| Lados | ausentes, conforme decisão registrada em conflitos.md | — | — |
| Regras de redação | sem datas nem nome ("em menos de uma semana" é pista legítima) | — | — |

## 5. Guerra Irã-Iraque (guerra-ira-iraque)

Fontes: [W] https://en.wikipedia.org/wiki/Iran%E2%80%93Iraq_War · [B] https://www.britannica.com/event/Iran-Iraq-War

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1980–1988 | correto (22/09/1980 a 20/08/1988) | W, B | — |
| Fundo: revolução islâmica derrubou a monarquia; ditador vizinho temia que inspirasse a maioria xiita | correto (Iraque "feared that Iran ... would rally Iraq's Shia majority") | W, B | — |
| Fundo: disputa antiga por hidrovia de fronteira | correto (Chatt al-Arab, cedido no Acordo de Argel de 1975) | W, B | — |
| Envolvidos: um lado com ocidentais, Estados árabes e uma superpotência comunista | correto (Iraque financiado por Arábia Saudita, Kuwait e outros, apoio tácito de EUA e URSS; W lista EUA, Reino Unido, URSS, França, Itália) | B, W | — |
| Envolvidos: o outro com aliados no Oriente Médio, norte da África e Ásia | correto (Síria, Líbia, Coreia do Norte, China e outros) | B, W | — |
| Estopim: tropas invadiram o oeste do país vizinho "no fim do verão" | impreciso para o público: em 22 de setembro é fim do verão no hemisfério norte, mas fim do inverno no Brasil, e a referência funciona como indicação de data. O resto está correto ("invaded western Iran"; objetivos territoriais e Chatt al-Arab) | B, W | "Tropas do ditador invadiram o oeste do país vizinho, de olho em territórios e na hidrovia disputada." |
| Desfecho: ataques a petroleiros e armas químicas, inclusive contra civis curdos | correto ("Tanker War"; Halabja, "as many as 5,000 Kurdish civilians") | B, W | — |
| Desfecho: resolução da ONU levou a cessar-fogo sem mudança permanente de fronteira | correto (Resolução 598; "did not create any permanent border changes") | B, W | — |
| Dado: cerca de 500 mil mortos, segundo a Britannica; baixas de 1 a 2 milhões | correto ("perhaps 500,000"; "from 1,000,000 to twice that number") | B | — |
| Lado A: Iraque | correto | W, B | — |
| Lado A: União Soviética, nota "Apoiou o Iraque" | correto ("Iraq's main arms supplier during the war") | W, B | Opcional: "Principal fornecedora de armas do Iraque." |
| Lado B: Irã | correto | W, B | — |
| Lado B: Síria, nota "País árabe que ajudou o Irã" | correto ("Iran's only major allies were Syria and Libya") | B, W | — |
| Lado B: Líbia, nota "Ajudou o Irã" | impreciso (lado mudou sem nota): a Líbia "distanced itself from Iran from 1987" e reatou com o Iraque | W | "Ajudou o Irã, mas se afastou dele a partir de 1987 e reatou com o Iraque." |
| Lado B: Coreia do Norte, nota "Ajudou o Irã" | correto ("a major arms supplier to Iran") | W | — |
| Lados: China | corretamente fora (vendeu armas aos dois lados) | W | — |

## 6. Guerras Iugoslavas (guerras-iugoslavas)

Fontes: [W] https://en.wikipedia.org/wiki/Yugoslav_Wars · [PT] https://pt.wikipedia.org/wiki/Guerras_iugoslavas · adicionais: [D] https://en.wikipedia.org/wiki/Dayton_Agreement · [N] https://en.wikipedia.org/wiki/NATO_intervention_in_Bosnia_and_Herzegovina · [S] https://en.wikipedia.org/wiki/Socialist_Republic_of_Serbia · [T] https://en.wikipedia.org/wiki/Josip_Broz_Tito

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1991–2001 | correto (W: 1/03/1991 a 13/08/2001; PT: "de 1991 a 2001") | W, PT | — |
| Fundo: morte do líder que governou por décadas | correto (Tito, no poder de 1943 até a morte, em 1980) | W, T | — |
| Fundo: crise econômica e nacionalismos | correto | W, PT | — |
| Fundo: a maior república defendia federação mais centralizada sob seu domínio | correto (Sérvia "demanded an even more centralized federation and Serbia's dominant role in it"; "the largest constituent republic ... in terms of population and territory") | W, S | — |
| Envolvidos: repúblicas e minorias contra o governo central e forças da república dominante | impreciso: vale para Eslovênia, Croácia, Bósnia e Kosovo, mas não para a insurgência de 2001, de albaneses contra o governo da Macedônia, nem para a guerra croata-bósnia | W, PT | ver abaixo |
| Envolvidos: aliança ocidental bombardeou "em duas ocasiões" | impreciso: além das campanhas de 1995 e 1999, a OTAN já atacara alvos sérvios na Bósnia em 1994 (Goražde, "first close air support mission on April 10, 1994") | N, W | "Repúblicas e minorias que buscavam independência ou autonomia, contra o governo federal, forças da república dominante e, por fim, o governo de uma das novas repúblicas; uma aliança militar ocidental interveio com bombardeios em duas das guerras." |
| Estopim: independência de duas repúblicas do norte; guerra curta na primeira | correto (Eslovênia, Guerra dos Dez Dias; Croácia e Eslovênia, junho de 1991) | W, PT | — |
| Estopim: guerra longa na segunda "que durou quatro anos" | impreciso: a W data a guerra croata de 1/03/1991 a 12/11/1995 ("4 years, 7 months"); a PT diz que os combates terminaram em meados de 1995 | W, PT | "A independência de duas repúblicas do norte levou a uma guerra curta na primeira e a uma longa na segunda, que durou cerca de quatro anos." |
| Desfecho: massacre reconhecido como genocídio | correto (Srebrenica, confirmado pelo tribunal) | W, PT | — |
| Desfecho: bombardeios ocidentais | correto | W, N | — |
| Desfecho: acordo "assinado nos Estados Unidos" encerrou a guerra na república do centro | correto, com ressalva: o acordo foi "initialed (signed legally) in Dayton, Ohio" em 21/11/1995 e "re-signed ceremonially in Paris" em 14/12/1995; as duas Wikipedias sobre as guerras citam a assinatura em Paris, o que pode gerar contestação | D, W, PT | Opcional: "um acordo negociado e rubricado nos Estados Unidos encerrou a guerra na república do centro" |
| Desfecho: guerra numa província do sul; insurgência na república mais ao sul; tribunal internacional | correto (Kosovo; Macedônia, 2001; TPI para a ex-Iugoslávia) | W, PT | — |
| Dado: estimativas entre 130 mil e 140 mil mortos | correto (ICTJ 140 mil; Humanitarian Law Center "at least 130,000") | W, PT | — |
| Lados | ausentes, conforme decisão registrada em conflitos.md | — | — |

## 7. Guerra Civil Síria (guerra-civil-siria)

Fontes: [W] https://en.wikipedia.org/wiki/Syrian_civil_war · [B] https://www.britannica.com/event/Syrian-Civil-War · adicionais: [PT] https://pt.wikipedia.org/wiki/Guerra_Civil_Síria · [CFR] https://www.cfr.org/global-conflict-tracker/conflict/conflict-syria · [DW] https://www.dawn.com/news/1888623 · [AJ1] https://aljazeera.com/news/2026/8/25/kurdish-led-forces-in-syria-dissolve-after-merging-with-the-army · [AM] https://www.al-monitor.com/index%2Ephp/originals/2026/09/fresh-fighting-syrias-suwayda-leaves-one-dead-what-know · [AJ2] https://www.aljazeera.com/news/2026/10/22/two-syrian-security-officers-killed-in-raid-on-isil-cell-near-damascus

### Situação em novembro de 2026 e forma de datar (consulta em 09/11/2026)

A Wikipedia em inglês dá a guerra por "15 March 2011 – 8 December 2024" e diz que "many sources regard this as the end of the civil war even though clashes have continued into 2026". O Council on Foreign Relations (página atualizada em 26/08/2026, com notícias de outubro e novembro de 2026) usa o título "Syria's Civil War (2011-24)" e classifica a situação atual como instabilidade política, "Unchanging". A Wikipedia em português ainda descreve a guerra como "um conflito interno em andamento", e a Britannica, na parte lida, mantém "February 2011 - present" e não cobre a queda de Assad. Conclusão: 2011–2024 é a forma usual nas fontes atualizadas em inglês, mas não é unânime; o período pode ser mantido, desde que o dado registre que há fontes que tratam o conflito como em curso.

Fatos de 2025 e 2026 confirmados: Ahmed al-Sharaa, já líder de fato, foi declarado presidente para o período de transição em 29/01/2025 (DW, 30/01/2025; a W fala em "appointment ... as president of Syria"); em janeiro de 2026 o governo tomou cerca de 80% do nordeste das Forças Democráticas Sírias, com cessar-fogo e acordo em seguida (CFR); em 25/08/2026 as Forças Democráticas Sírias, lideradas por curdos, anunciaram a dissolução após se integrarem ao exército (AJ1); em 01/09/2026 o Al-Monitor relatou novos combates em Suwayda entre forças do governo e uma milícia drusa e disse que a província segue fora do controle militar exclusivo de Damasco (AM); em outubro de 2026 as forças de segurança enfrentaram células do Estado Islâmico perto de Damasco e em Homs (AJ2, 22/10/2026).

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 2011–2024 | correto como forma usual (W, CFR), não unânime (PT, B) | W, CFR, PT, B | manter; ajustar o dado (abaixo) |
| Fundo: mesma família governava havia décadas, com restrições às liberdades | correto (Assad desde 1971; liberdades "strictly controlled") | W, B | — |
| Fundo: protestos ligados à onda de revoltas árabes, reprimidos com violência | correto | B, W | — |
| Envolvidos: governo apoiado por grande potência, república islâmica e milícia libanesa | correto (Rússia, Irã, Hezbollah) | W, B | — |
| Envolvidos: rebeldes apoiados por vizinho do norte e monarquias do Golfo; curdos e jihadistas em outras frentes | correto (Turquia, Arábia Saudita, Catar; Forças Democráticas Sírias; Estado Islâmico e grupos ligados à Al-Qaeda). Omissão: os EUA também apoiaram rebeldes e as forças curdas, o que não torna a pista errada | W, B | — |
| Estopim: prisão de crianças por pichações numa cidade do sul desencadeou protestos | correto (crianças "arrested and tortured ... for writing antiregime graffiti" em Daraa, "in southern Syria") | B | — |
| Estopim: "transformou a revolta em guerra civil" | fora da regra (limítrofe): "guerra civil" repete dois terços do nome do conflito; a ficha espanhola evita a expressão | B | "A prisão e a tortura de crianças por pichações contra o regime, numa cidade do sul, desencadearam protestos, e a repressão dura transformou a revolta em conflito armado." |
| Desfecho: ataques químicos do governo; anos de intervenção estrangeira | correto (Ghouta, 2013; Khan Shaykhun, 2017; 98% dos ataques químicos atribuídos ao regime) | W | — |
| Desfecho: rebeldes tomaram a capital e o presidente fugiu para Moscou | correto | W | — |
| Desfecho: "um líder rebelde passou a governar de fato" | desatualizado: ele foi declarado presidente de transição em janeiro de 2025 | W, DW | "Depois de ataques químicos do governo e de anos de intervenção estrangeira, rebeldes tomaram a capital e o presidente fugiu para Moscou; o líder rebelde que comandou a ofensiva assumiu o poder e foi declarado presidente de transição, embora os confrontos tenham continuado." |
| Desfecho: confrontos continuaram | correto (Suwayda, Estado Islâmico, nordeste em janeiro de 2026) | W, CFR, AM, AJ2 | — |
| Dado: "é dada como encerrada" | impreciso: a W diz "many sources regard this as the end"; a PT a trata como em andamento | W, PT | ver abaixo |
| Dado: cerca de 656 mil mortos até março de 2025 | correto (656.493) | W | — |
| Dado: 6,6 milhões de refugiados em março de 2021 | correto conforme a infobox; o corpo da W traz número mais recente, 6,7 milhões em dezembro de 2022 | W | ver abaixo |
| Dado: data da consulta (06/11/2026) | desatualizado: falta o fim das Forças Democráticas Sírias (agosto de 2026) e o título de presidente de transição | AJ1, DW | "Situação em 09/11/2026: a Wikipedia em inglês e o Council on Foreign Relations dão a guerra civil por encerrada com a queda de Assad, em dezembro de 2024, mas a Wikipedia em português ainda a trata como em andamento. Em 2026 houve combates em Suwayda e ações contra células do Estado Islâmico, e as Forças Democráticas Sírias, lideradas por curdos, se dissolveram no exército. Eram cerca de 656 mil mortos até março de 2025 e 6,7 milhões de refugiados em dezembro de 2022." |
| Lados | ausentes, conforme decisão registrada em conflitos.md | — | — |

## Resumo das correções

Necessárias (erro factual, regra de redação ou desatualização):

1. Guerra Civil Espanhola, dado: os números estão invertidos. Texto: "Morreram cerca de 110 mil combatentes republicanos e 90 mil nacionalistas, além de dezenas a centenas de milhares de civis nas duas zonas, conforme as estimativas."
2. Guerra Civil Espanhola, envolvidos: "ajuda soviética e mexicana" nomeia participantes e "defensores da república" quase repete o nome do lado. Texto: "Os defensores do governo eleito, com armas de uma superpotência comunista e de um país latino-americano e com voluntários estrangeiros, contra generais rebelados e seus aliados, apoiados por dois regimes fascistas europeus e por um país vizinho."
3. Primeira Guerra Árabe-Israelense, envolvidos: o Iraque não era vizinho. Texto: "Um Estado recém-declarado contra cinco Estados árabes, quatro deles vizinhos, e um exército de voluntários árabes."
4. Guerra Irã-Iraque, Líbia: lado mudou sem nota. Nota: "Ajudou o Irã, mas se afastou dele a partir de 1987 e reatou com o Iraque."
5. Guerra Irã-Iraque, estopim: tirar "no fim do verão" (referência temporal que, no Brasil, indica o inverno). Texto: "Tropas do ditador invadiram o oeste do país vizinho, de olho em territórios e na hidrovia disputada."
6. Guerra Civil Síria, desfecho: al-Sharaa foi declarado presidente de transição em janeiro de 2025. Texto: "...; o líder rebelde que comandou a ofensiva assumiu o poder e foi declarado presidente de transição, embora os confrontos tenham continuado."
7. Guerra Civil Síria, estopim: trocar "guerra civil" por "conflito armado".
8. Guerra Civil Síria, dado: atualizar para a consulta de 09/11/2026 (texto na tabela da ficha 7). O período 2011–2024 pode ficar, pois é a forma usual nas fontes atualizadas em inglês.

Recomendadas (precisão):

9. Primeira Guerra Mundial, envolvidos: incluir a Sérvia ("...um império eslavo e um pequeno reino balcânico... e a outro reino balcânico").
10. Primeira Guerra Mundial, fundo: "desafiava nos Bálcãs um império multiétnico da Europa Central".
11. Primeira Guerra Mundial, desfecho: "Terminou com armistícios e tratados de paz, entre eles o de Versalhes."
12. Primeira Guerra Mundial, notas: Itália (1915 contra a Áustria-Hungria, 1916 contra a Alemanha) e Romênia (paz em separado em maio de 1918 e volta à guerra em 10 de novembro de 1918).
13. Guerra Civil Espanhola, fundo: "Uma república jovem" em vez de "recém-proclamada"; opcionalmente, Portugal em Lados B, com nota.
14. Primeira Guerra Árabe-Israelense, desfecho: "a Transjordânia ocupou e depois anexou a Cisjordânia"; opcionalmente, nota de participação limitada para o Líbano e "provavelmente mais de 700 mil" no dado.
15. Guerra dos Seis Dias, estopim: "fechou um estreito à navegação israelense".
16. Guerras Iugoslavas, envolvidos: incluir a insurgência contra o governo de uma das novas repúblicas e trocar "em duas ocasiões" por "em duas das guerras"; estopim: "durou cerca de quatro anos"; opcionalmente, "acordo negociado e rubricado nos Estados Unidos".

Sem pendência de confirmação: todos os itens das sete fichas foram confirmados ou corrigidos com fonte lida; nenhum ficou como "não confirmado". A ficha espanhola continua com uma fonte só no campo "fontes", porque a Britannica falhou; a Wikipedia em português e a Spartacus Educational, usadas aqui, podem ser acrescentadas.

## Correções aplicadas (09/11/2026)

Aplicadas as oito correções necessárias e as recomendadas 9 a 16, com os textos sugeridos. Dos opcionais, entraram: Portugal nos Nacionalistas da Guerra Civil Espanhola, com nota (a pista de envolvidos agora fala em "um país vizinho"); nota da Alemanha nazista sobre a Legião Condor; nota de participação limitada do Líbano e "provavelmente mais de 700 mil" no dado da Primeira Guerra Árabe-Israelense; nota da União Soviética como principal fornecedora de armas do Iraque; "acordo negociado e rubricado nos Estados Unidos" nas Guerras Iugoslavas. Novas fontes nas fichas: Romania in World War I, Wikipedia em português e Spartacus Educational (Guerra Civil Espanhola), Jordanian annexation of the West Bank, Dayton Agreement, Council on Foreign Relations e Al Jazeera (Guerra Civil Síria).
