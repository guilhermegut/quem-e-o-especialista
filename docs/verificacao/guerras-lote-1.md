# Verificação independente das fichas de guerras, lote 1

Data da consulta: 09/11/2026.

Escopo: as 8 fichas de src/data/conflitos.json (guerra-russo-japonesa, guerra-civil-russa, segunda-guerra-mundial, guerra-da-argelia, guerra-do-yom-kipur, guerra-das-malvinas, guerra-do-afeganistao, guerra-russo-ucraniana). Nenhum arquivo do projeto foi editado.

Método: cada afirmação (período, região, as quatro pistas, dado e cada participante de Lados com sua nota) foi conferida com WebFetch nas URLs do campo "fontes". Quando a fonte listada falhou ou não cobria o ponto, usou-se uma fonte adicional, indicada na tabela. Também foram conferidas as regras de redação: pistas sem datas e sem o nome do conflito, pista de envolvidos sem nomear os lados nem os participantes, nenhum número de mortos perguntado, nenhum participante no lado errado ou ambíguo sem nota (incluindo a regra do projeto de que quem mudou de lado só entra com nota que explique a fase). Nada foi dado como confirmado com base em memória.

Limitações: o WebFetch entrega um resumo da página feito por um modelo auxiliar, em blocos de 100 mil caracteres; nos artigos longos foram lidos os blocos necessários. As páginas da Britannica chegaram truncadas ou com cobertura parcial: a da Guerra Russo-Japonesa só com a introdução, a da Guerra Civil Russa só até o início de 1919, a do Afeganistão só até 2014 e a da invasão russa da Ucrânia só até o fim de 2022. A página da Britannica sobre a Segunda Guerra Mundial (https://www.britannica.com/event/World-War-II) falhou (client_error). Para a situação atual da Ucrânia, CNBC falhou (client_error) e NPR e ADN recusaram o acesso (robots); usaram-se Al Jazeera, Al-Monitor/Reuters, Hürriyet Daily News, The Star e Russia Matters. A página da Wikipedia em inglês sobre a guerra russo-ucraniana entregue em 09/11/2026 parece ser um retrato de meados de 2026 (infobox "12 years and 4 months"; ocupação "as of June 2026").

Legenda de resultado: correto; incorreto (erro factual ou violação de regra de redação); impreciso (verdadeiro em essência, mas incompleto, exagerado ou mal formulado); não confirmado.

## 1. guerra-russo-japonesa

Fontes: [W] https://en.wikipedia.org/wiki/Russo-Japanese_War; [B] https://www.britannica.com/event/Russo-Japanese-War (só a introdução).

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1904–1905 | correto | W (8/2/1904 a 5/9/1905); B | — |
| Região Ásia | correto | W, B | — |
| Fundo: disputa pela Manchúria e pela Coreia | correto | W ("rival imperial ambitions in Manchuria and the Korean Empire"); B | — |
| Fundo: um império obtivera da China o arrendamento de Port Arthur | correto | W (arrendamento da península de Liaodong e de Port Arthur em 1898); B | — |
| Envolvidos: império insular asiático contra império europeu que mandou a frota do Báltico ao Pacífico | correto | W (viagem de mais de sete meses e 18 mil milhas náuticas) | — |
| Estopim: ataque surpresa à frota em Port Arthur | correto | W (ataque três horas antes de a declaração de guerra ser recebida) | — |
| Desfecho: Mukden antes de Tsushima; frota do Báltico destruída | correto | W | — |
| Desfecho: tratado mediado pelo presidente americano | correto | W (Theodore Roosevelt, Portsmouth) | — |
| Desfecho: arrendamento de Port Arthur, sul de Sacalina, interesses na Coreia | correto | W (o Japão recebeu também a ferrovia do Sul da Manchúria, não citada) | — |
| Dado: primeira vitória moderna de potência asiática sobre europeia | correto | W ("first major military victory in the modern era"); B | — |
| Dado: a derrota contribuiu para a Revolução de 1905 | correto | W | — |
| Regras de redação | correto | — | Sem datas, sem o nome; envolvidos não nomeia os lados. Ficha sem Lados, coerente com o critério "um contra um". |

Nenhuma correção.

## 2. guerra-civil-russa

Fontes: [W] https://en.wikipedia.org/wiki/Russian_Civil_War; [B] https://www.britannica.com/event/Russian-Civil-War (cobre só até o início de 1919); adicional [CL] https://en.wikipedia.org/wiki/Czechoslovak_Legion.

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1917–1922 | correto | W (infobox 7/11/1917 a 25/10/1922; o texto registra resistência até junho de 1923); B usa 1918–20 | Manter; a divergência entre fontes é de critério. |
| Região Europa | correto | W | — (a guerra se estendeu à Sibéria; aceitável) |
| Fundo: duas revoluções em meio à guerra mundial; oposição armada à tomada do poder | correto | W | — |
| Envolvidos: governo revolucionário contra exércitos de generais e almirantes do antigo regime, com intervenção estrangeira | correto | W ("led mainly by the right-leaning officers of the Russian Empire"; 13 Estados estrangeiros intervieram) | — |
| Envolvidos: "uma legião tchecoslovaca" | incorreto (regra) | — | Repete, em minúsculas, o nome do participante "Legião Tchecoslovaca". O teste automático não pega porque compara maiúsculas. Ver texto abaixo. |
| Envolvidos: "exércitos camponeses e movimentos de independência" | impreciso | W (os exércitos verdes se opunham aos bolcheviques, aos brancos e aos intervencionistas) | A frase os põe no mesmo bloco dos brancos. Texto sugerido: "A força armada do novo governo revolucionário contra exércitos comandados por generais e almirantes do antigo regime, apoiados por intervenção estrangeira e por uma legião de desertores do exército austro-húngaro; exércitos camponeses, que combatiam os dois lados, e movimentos de independência também pegaram em armas." (desertores austro-húngaros: B) |
| Estopim: a oposição virou guerra em larga escala no ano seguinte | correto | W ("full-scale civil war in May–June 1918") | — |
| Desfecho: Terror Vermelho | correto | W, B | — |
| Desfecho: requisição de grãos provocou revoltas camponesas | correto | W (rebelião de Tambov) | — |
| Desfecho: os vermelhos venceram e fundaram a União Soviética | correto | W | — |
| Desfecho: fome de cerca de cinco milhões de mortos | correto | W ("killed about five million people") | Não viola a regra literal (o número não é perguntado), mas é número de mortos dentro de uma pista. Se a intenção for mantê-los fora das pistas: "...os vermelhos venceram e fundaram a União Soviética; uma grande fome devastou o país no fim da guerra." |
| Dado: 7 a 12 milhões de mortos, maioria civis | correto | W (introdução: "7 to 12 million casualties during the war, mostly civilians"; corpo: "as many as 10 million people died") | — |
| Lados: Exército Vermelho | correto | W, B | — |
| Lados: Lenin, nota "Liderava o governo bolchevique" | correto | W, B | — |
| Lados: Trótski, nota "Reorganizou o Exército Vermelho" | impreciso | W ("headed the reorganization of the Red Guards into a Workers' and Peasants' Red Army"); B ("commissar for war") | Nota: "Como comissário da guerra, transformou a Guarda Vermelha no Exército Vermelho." |
| Lados: Kolchak, Denikin, Wrangel | correto | W (os três como comandantes brancos); B (Kolchak e Denikin) | — |
| Lados: Legião Tchecoslovaca, sem nota | impreciso | CL (revoltou-se contra os bolcheviques e tomou a Transiberiana em 1918; no fim de 1919 declarou-se neutra, entregou Kolchak ao Centro Político em Irkutsk e fez armistício com o 5º Exército Vermelho para sair pelo porto de Vladivostok) | Lado correto, mas mudou de postura no fim. Nota: "Revoltou-se contra os bolcheviques e tomou a Transiberiana; no fim, declarou-se neutra e negociou com os vermelhos a saída do país." |
| Lados: Japão, nota "Desembarcou tropas no leste" | correto | B (desembarque em Vladivostok em abril de 1918); W (apoio japonês a Semenov) | — |
| Lados: Reino Unido, nota "Desembarcou tropas no norte" | correto | B (Murmansk e Arkhangelsk); W ("Britain intervened in support of the White forces") | — |

## 3. segunda-guerra-mundial

Fontes: [W] https://en.wikipedia.org/wiki/World_War_II (única fonte da ficha). A Britannica (https://www.britannica.com/event/World-War-II) falhou. Adicionais: [BR] https://en.wikipedia.org/wiki/Brazil_in_World_War_II; [BG] https://britannica.com/place/Bulgaria/World-War-II; [HH] https://www.historyhit.com/countries-that-switched-from-the-axis-powers-to-the-allies/.

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1939–1945 | correto | W (1/9/1939 a 2/9/1945) | — |
| Região Europa | correto | W | Simplificação de uma guerra mundial; aceitável, porque o campo só orienta a escolha de distratores. |
| Fundo: tensões da guerra anterior, ressentimento alemão com o tratado, fascismo e nazismo, expansão de império asiático, apaziguamento | correto | W (Versalhes, ascensão do fascismo, militarismo japonês e Manchúria, "policy of appeasement") | — |
| Envolvidos: "contra um eixo de três potências" | incorreto (regra) | — | "Eixo" é o nome do lado b. A descrição também omite a China, que está em Lados. Texto sugerido: "Uma aliança de democracias ocidentais, de um país asiático já invadido pelo vizinho, de um Estado comunista que antes tinha feito um pacto com o agressor e, depois, da maior potência das Américas, contra uma aliança de três potências expansionistas e seus parceiros europeus." |
| Estopim: invasão da Polônia; Reino Unido e França declaram guerra | correto | W | — |
| Desfecho: "Depois do Holocausto e dos bombardeios atômicos..., a Alemanha se rendeu em maio e o Japão em setembro" | incorreto | W (rendição alemã em 8/5/1945; bombas em 6 e 9/8/1945; Japão anuncia rendição em 15/8 e assina em 2/9/1945) | A frase põe a rendição alemã depois das bombas, mas ela veio três meses antes. "Em maio" e "em setembro" também são datas dentro da pista; o teste automático só detecta anos. Texto sugerido: "Depois do Holocausto, a Alemanha se rendeu; meses depois, após os bombardeios atômicos de Hiroshima e Nagasaki, o Japão também capitulou. Surgiram as Nações Unidas, e começou a Guerra Fria." |
| Desfecho: ONU e início da Guerra Fria | correto | W | — |
| Dado: 60 a 75 milhões de mortos | correto | W (introdução: "60 to 75 million deaths") | — |
| Lados: Reino Unido, França | correto | W | — |
| Lados: União Soviética, nota sobre o pacto e a invasão de 1941 | correto | W (protocolo secreto com a partilha da Polônia; Operação Barbarossa em 22/6/1941) | — |
| Lados: Estados Unidos, nota sobre Pearl Harbor | correto | W | — |
| Lados: China | correto | W (um dos "Big Four" aliados) | — |
| Lados: Alemanha, Japão | correto | W | — |
| Lados: Hungria | correto | W (aderiu ao Pacto Tripartite em novembro de 1940; combates em território húngaro até a queda de Budapeste, em fevereiro de 1945) | — |
| Lados: Romênia, sem nota | incorreto (regra) | W (golpe em 1944 "followed by those countries' shift to the Allied side"); HH (mudou de lado em agosto de 1944) | Mudou de lado; pela regra do projeto, precisa de nota ou deve sair. Nota: "Aderiu ao Eixo em 1940; em 1944, depois de um golpe, passou para o lado dos Aliados." |
| Lados: Bulgária, sem nota | incorreto (regra) | W (mesma frase); BG (aderiu ao Eixo em 1/3/1941; declarou guerra à Alemanha em 8/9/1944); HH | Nota: "Aderiu ao Eixo em 1941; em 1944, depois de um golpe, declarou guerra à Alemanha e passou para o lado dos Aliados." |
| Omissão: Itália | observação | W (núcleo do Eixo no Pacto Tripartite; armistício com os Aliados em 1943); HH | Não é erro. Se entrar: "Membro central do Eixo; depois do armistício de 1943, o novo governo passou para o lado dos Aliados." |
| Omissão: Brasil (pendência registrada em conflitos.md) | observação | BR (declarou guerra ao Eixo em 22/8/1942; único país sul-americano a mandar tropas de combate ao exterior; FEB na Itália) | A pendência pode ser resolvida com esta fonte. Nos Aliados: "Brasil", nota "Declarou guerra ao Eixo em 1942 e mandou a Força Expedicionária Brasileira lutar na Itália." |

## 4. guerra-da-argelia

Fontes: [W] https://en.wikipedia.org/wiki/Algerian_War (única fonte da ficha). Adicional: [B] https://www.britannica.com/event/Algerian-War (cobertura sumária).

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1954–1962 | correto | W (1/11/1954 a 19/3/1962); B | — |
| Região África | correto | W | — |
| Fundo: "colônia norte-africana ocupada havia mais de um século" | correto | W (Argel tomada em 1830; colônia militar em 1834; a partir de 1848, "parte integrante da França", em três departamentos) | Correto no uso corrente. Se quiser precisão jurídica: "Um território norte-africano conquistado havia mais de um século e incorporado à metrópole como departamentos..." |
| Fundo: domínio dos colonos e desigualdade legal | correto | W (Código do Indigenato) | — |
| Fundo: massacre no fim da guerra mundial aumentou o ressentimento | correto | W (Sétif e Guelma, 1945, "considered by some historians to have been a cause of the war") | — |
| Envolvidos: "Uma frente de libertação nacional" | incorreto (regra) | — | Repete o nome do único participante do lado a. O teste automático não pega porque compara maiúsculas. Ver texto abaixo. |
| Envolvidos: braço armado; auxiliares locais | correto | W (ALN; harkis) | — |
| Envolvidos: "organização armada de colonos" | impreciso | W (OAS "formed mainly from French military personnel"; fundadores Salan, Susini e Lagaillarde; "main standard bearer for the Pied-Noirs") | Texto sugerido: "Um movimento nacionalista armado e seu exército de guerrilha contra a metrópole, que contava com auxiliares muçulmanos locais e, no fim, enfrentou também uma organização clandestina de militares e colonos contrária à independência." |
| Estopim: "no primeiro dia de novembro" | incorreto (regra) | W (Toussaint Rouge: ataques a alvos militares e civis em toda a Argélia em 1/11/1954) | O fato está correto, mas dia e mês formam uma data. Texto sugerido: "Uma onda de ataques coordenados do movimento contra alvos militares e civis em vários pontos do território abriu a guerra." |
| Desfecho: batalha de Argel; tortura | correto | W; B (batalha de Argel) | — |
| Desfecho: crise que levou um general ao poder | correto | W (crise de maio de 1958; De Gaulle aprovado pelo parlamento) | — |
| Desfecho: acordos de Évian aprovados em referendo; independência | correto | W (91% na França em abril de 1962; voto pela independência na Argélia em 1/7/1962) | Opcional: "em referendos", porque foram dois. |
| Desfecho: cerca de 900 mil colonos partiram | correto | W | — |
| Dado: 400 mil a 1,5 milhão de argelinos mortos | correto | W ("between 400,000 and 1.5 million Algerians") | — |
| Lados: FLN, nota sobre 1º de novembro de 1954 | correto | W | — |
| Lados: França | correto | W | — |
| Lados: Harkis, nota "Auxiliares argelinos do exército francês" | correto | W | — |

## 5. guerra-do-yom-kipur

Fontes: [W] https://en.wikipedia.org/wiki/Yom_Kippur_War; [B] https://www.britannica.com/event/Yom-Kippur-War. Adicional: [H] https://www.history.com/topics/middle-east/yom-kippur-war.

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1973 | correto | W (6 a 25/10/1973); B (6 a 26/10) | — |
| Região Oriente Médio | correto | W | — |
| Fundo: seis anos depois, dois países árabes queriam recuperar territórios perdidos | correto | H (perdas de 1967: Sinai e Golã); W (Sinai) | — |
| Fundo: iniciativas de Sadat rejeitadas | correto | W (proposta de 1971 engavetada; última iniciativa rejeitada em fevereiro de 1973); B | — |
| Envolvidos: "com forças de outros vizinhos" | impreciso | W (forças expedicionárias de Arábia Saudita, Argélia, Jordânia, Líbia, Iraque, Kuwait, Tunísia e Marrocos, além de Cuba e Coreia do Norte) | A maioria não faz fronteira com Israel. Texto sugerido: "Uma coalizão árabe liderada por dois países, com tropas de outros países árabes, contra um Estado judeu; cada lado recebeu reabastecimento de uma superpotência rival." |
| Envolvidos: reabastecimento por superpotências rivais | correto | W, B | — |
| Estopim: ataque surpresa em duas frentes no dia mais sagrado do calendário judaico | correto | B (duas frentes simultâneas); W; H ("the holiest day in the Jewish calendar") | Observação editorial: a pista quase traduz o nome do conflito; não viola a regra. |
| Desfecho: cessar-fogos da ONU depois de um embargo de petróleo | correto | W (corte de produção em 17/10, embargo saudita depois de 19/10, Resolução 338 em 22/10, segundo cessar-fogo em 25/10); B | — |
| Desfecho: acordos que devolveram uma península e levaram à paz | correto | W, B | — |
| Dado: Camp David (1978) e tratado de 1979 "devolveram o Sinai" | impreciso | W (últimas tropas israelenses saíram do Sinai em 26/4/1982; o tratado foi o primeiro reconhecimento de Israel por um país árabe); B ("led to Israel's full withdrawal") | Texto sugerido: "Os Acordos de Camp David, de 1978, e o tratado de paz de 1979 levaram à devolução do Sinai ao Egito, concluída em 1982; foi a primeira vez que um país árabe reconheceu Israel." |
| Lados: Israel | correto | W, B | — |
| Lados: Estados Unidos, nota sobre reabastecimento | correto | W (Operação Nickel Grass); B | — |
| Lados: Egito, Síria | correto | W, B | — |
| Lados: Iraque, nota "Enviou forças à coalizão" | correto | W (3ª e 6ª divisões blindadas na Síria) | — |
| Lados: Jordânia, nota "Enviou forças à coalizão" | impreciso | W ("despite refusing to participate", o rei Hussein mandou brigadas à frente do Golã) | Nota: "Não abriu frente própria, mas mandou brigadas para a frente síria." |
| Lados: União Soviética, nota sobre reabastecimento | correto | W (ponte aérea e marítima a Egito e Síria); B | — |

## 6. guerra-das-malvinas

Fontes: [W] https://en.wikipedia.org/wiki/Falklands_War; [B] https://www.britannica.com/event/Falkland-Islands-War.

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 1982 | correto | W (2/4 a 14/6/1982); B | — |
| Região América do Sul | correto | W | — |
| Fundo: reivindicação de mais de um século; arquipélago tomado por potência europeia | correto | B (tomada britânica em 1833; reivindicação argentina desde o início do século XIX) | — |
| Fundo: junta criticada pela crise econômica e por direitos humanos apostou na "recuperação" | correto | B; W ("chronic economic problems", "human rights violations of its Dirty War") | — |
| Envolvidos: ditadura contra antiga potência europeia com força-tarefa naval | correto | W, B | — |
| Envolvidos: vizinho ajudou os europeus; superpotência apoiou | correto | W (o Chile deu informações de inteligência e não apoiou a posição argentina; os EUA proibiram vendas de armas à Argentina e deram apoio material); B | — |
| Estopim: sucateiros infiltrados por fuzileiros hastearam a bandeira numa ilha subantártica; depois, a invasão | correto | W (Geórgia do Sul, então dependência das Falklands; "infiltrated by Argentine Marines"); B | — |
| Desfecho: afundamento de um cruzador | correto | W (General Belgrano) | — |
| Desfecho: "um destróier europeu" | impreciso | W (dois destróieres perdidos, Sheffield e Coventry, além das fragatas Ardent e Antelope) | Ver texto abaixo. |
| Desfecho: "as tropas da capital das ilhas se renderam" | impreciso | W (o general Menéndez, comandante argentino nas ilhas, rendeu-se em Stanley) | Texto sugerido para o desfecho: "Após o afundamento de um cruzador sul-americano e de dois destróieres europeus e de combates em terra, o comandante sul-americano se rendeu na capital das ilhas; a derrota apressou a queda da junta, e o governo vencedor ampliou sua maioria na eleição seguinte." |
| Desfecho: queda da junta; maioria ampliada na eleição seguinte | correto | W | — |
| Dado: 649 argentinos, 255 britânicos, 3 moradores | correto | W | — |
| Lados: Argentina, Reino Unido | correto | W, B | — |
| Lados: Chile, nota "Ajudou os britânicos" | correto | W | Opcional, mais preciso: "Passou aos britânicos informações de inteligência sobre os militares argentinos." |
| Lados: Estados Unidos, nota "Apoiou o Reino Unido" | correto | W; B (depois de fracassada a mediação) | — |

## 7. guerra-do-afeganistao

Fontes: [W] https://en.wikipedia.org/wiki/War_in_Afghanistan_(2001%E2%80%932021); [P] https://pt.wikipedia.org/wiki/Guerra_do_Afeganist%C3%A3o_(2001%E2%80%932021); [B] https://www.britannica.com/event/Afghanistan-War (cobre só até 2014).

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período 2001–2021 | correto | W (7/10/2001 a 30/8/2021) | — |
| Região Ásia | correto | W | — |
| Fundo: o Talibã abrigava a Al-Qaeda e recusou entregar Bin Laden | correto | W, B, P | — |
| Envolvidos: superpotência, aliança ocidental e forças locais contra o movimento, a rede terrorista e um grupo aliado | correto | W (Rede Haqqani "deeply integrated with the Taliban"); P | — |
| Envolvidos: vizinho acusado de dar dinheiro e refúgio | correto | W ("significant funding, access to safe houses, and political support to the Taliban") | — |
| Estopim: invasão menos de um mês depois; regime caiu em cerca de dois meses | correto | W (7/10/2001); B (Cabul em 13/11 e Kandahar em 6/12/2001, "marking the end of Taliban power") | — |
| Desfecho: morte do líder terrorista num país vizinho | correto | W, P (Abbottabad, Paquistão, 2011) | — |
| Desfecho: acordo no Catar fixou a retirada | correto | P (Doha, 29/2/2020); W ("United States–Taliban deal in 2020") | — |
| Desfecho: retomada da capital; últimas tropas saíram duas semanas depois | correto | W (15/8 e 30/8/2021) | — |
| Dado: 176 mil a mais de 212 mil mortos, mais de 46 mil civis | correto | W ("176,000–212,000+ people, including 46,319 civilians") | O infobox da W traz outro total, e a P cita 174 mil (Brown, abril de 2021). A faixa usada está na fonte. |
| Dado: "segundo a Wikipedia em inglês, o Paquistão ajudou o Talibã" | impreciso | W (financiamento, abrigo e apoio político; o Paquistão "had been seen as a firm ally" no início) | A referência à fonte dentro do texto do jogo é estranha ao leitor. Texto sugerido: "Morreram de 176 mil a mais de 212 mil pessoas, entre elas mais de 46 mil civis. O Paquistão, visto como aliado firme dos Estados Unidos no início da guerra, dava dinheiro, abrigo e apoio político ao Talibã." |
| Lados: Estados Unidos, Reino Unido | correto | W; B (ataques de aviões americanos e britânicos desde 7/10/2001) | — |
| Lados: OTAN, nota "Liderou a força internacional ISAF" | impreciso | W (ISAF autorizada pela ONU em 20/12/2001; a OTAN assumiu o comando em 11/8/2003); P | Nota: "A partir de 2003, comandou a força internacional ISAF." |
| Lados: Aliança do Norte, nota | correto | W, B, P | — |
| Lados: Governo afegão | correto | W | — |
| Lados: Talibã, Al-Qaeda, Rede Haqqani | correto | W | — |

## 8. guerra-russo-ucraniana

Fontes: [W] https://en.wikipedia.org/wiki/Russo-Ukrainian_war (versão entregue em 09/11/2026 com aparência de retrato de meados de 2026); [B] https://www.britannica.com/event/2022-Russian-invasion-of-Ukraine (cobre só até o fim de 2022). Adicionais sobre a situação atual: [AJ1] https://www.aljazeera.com/news/2026/11/1/ukraine-evacuates-civilians-in-kherson-region-as-localised-ceasefire-ends (1/11/2026); [AJ2] https://www.aljazeera.com/news/2026/11/6/in-ukraine-russias-territorial-gains-dwindle-as-its-diesel-goes-unsold (6/11/2026); [AM] https://www.al-monitor.com/originals/2026/11/us-mediate-trilateral-talks-ukraine-russia-abu-dhabi-next-week-us-envoy-says (Reuters, 2/11/2026); [HD] https://www.hurriyetdailynews.com/russia-agrees-to-new-ukraine-peace-talks-in-abu-dhabi-228542 (24/10/2026); [ST] https://www.thestar.com.my/news/world/2026/11/07/russia-says-it-hit-targets-in-and-around-kyiv-in-massive-overnight-strike (7/11/2026); [TR] https://en.wikipedia.org/wiki/2026_Russo-Ukrainian_truce; [RM] https://www.russiamatters.org/node/41766 (15/7/2026); [AJ3] https://www.aljazeera.com/news/2026/2/24/mapping-russian-attacks-and-territorial-gains-across-ukraine (24/2/2026).

Situação em 09/11/2026: a guerra continua. Não há cessar-fogo geral nem acordo de paz em vigor. Em 2026 houve só tréguas curtas ou locais, todas encerradas: a trégua de Páscoa de 32 horas (11 a 13/4/2026, segundo TR) e a trégua localizada em Oleshky, na região de Kherson, terminada em 1/11/2026 sem prorrogação (AJ1, AJ2). Em 7/11/2026 houve ataque russo de grande porte contra Kiev (ST). Os EUA anunciaram negociações trilaterais em Abu Dhabi para 10 e 11/11/2026, com os lados "far apart" quanto aos termos (AM, HD). A ocupação russa é de cerca de 19% a 20% do território ucraniano (W, "roughly 20%... as of June 2026"; RM: 19% pelo DeepState e cerca de 20% pelo ISW em julho de 2026; AJ3: 20% em fevereiro de 2026).

| Item | Resultado | Fonte | Correção sugerida |
|---|---|---|---|
| Período "desde 2014" | correto | W ("Late February 2014 – present", "Ongoing"); AJ1, AJ2, AM, ST | — |
| Região Europa | correto | W | — |
| Fundo: protestos, fuga do presidente, Revolução da Dignidade | correto | W | — |
| Envolvidos: grande potência e separatistas contra o vizinho, com ajuda ocidental | correto | W, B | — |
| Envolvidos: aliado cedeu território para ataques | correto | W (ofensiva no norte lançada a partir de Belarus); B | — |
| Envolvidos: tropas de regime asiático lutaram ao lado dos invasores | correto | W (tropas norte-coreanas em combate na região de Kursk, confirmado pela Rússia) | — |
| Estopim: tropas disfarçadas ocuparam e anexaram a península | correto | W ("unmarked Russian soldiers seized the Crimean parliament") | — |
| Estopim: "forças locais apoiadas pelo vizinho" tomaram parte do leste | impreciso | W ("Russian-backed militants"; a Rússia apoiou os separatistas "with its own troops, tanks and artillery"; uma unidade paramilitar veio da Crimeia ocupada) | Texto sugerido: "Tropas disfarçadas ocuparam e anexaram uma península no mar Negro, e logo depois milícias separatistas, apoiadas e em parte comandadas pelo vizinho, tomaram parte de uma região industrial do leste." |
| Desfecho: acordos de Minsk nunca cumpridos por inteiro | correto | W ("never fully implemented") | — |
| Desfecho: invasão em grande escala fracassou diante da capital | correto | W (desistência de tomar Kiev no início de abril de 2022); B | — |
| Desfecho: guerra sem acordo de paz, cerca de um quinto ocupado | correto | AM, HD, ST; W, RM, AJ3 | Rever depois das negociações de 10 e 11/11/2026 em Abu Dhabi. |
| Dado: situação "em 06/11/2026, segundo a Wikipedia em inglês" | não confirmado (a data) | W | Não foi possível ver a página como estava em 06/11/2026: a versão entregue em 09/11/2026 parece ser de meados de 2026. O conteúdo está confirmado pelas notícias até 7/11/2026. |
| Dado: guerra continua, sem cessar-fogo nem acordo de paz, cerca de 20% ocupado; invasão em 24/2/2022 | correto | W, AJ1, AJ2, AM, RM; W e B (24/2/2022) | Texto atualizado: "Situação em 09/11/2026: a guerra continua, sem cessar-fogo geral nem acordo de paz; as tréguas de 2026 foram curtas ou locais e já terminaram, e a Rússia ocupa cerca de um quinto do território ucraniano. A invasão em grande escala começou em 24 de fevereiro de 2022." |
| Lados: Rússia; Separatistas do Donbas | correto | W | — |
| Lados: Belarus, nota "Cedeu território para ataques" | correto | W, B | — |
| Lados: Coreia do Norte, nota sobre Kursk | correto | W | — |
| Lados: Ucrânia | correto | W, B | — |

## Resumo das correções

Correções necessárias, por erro factual ou violação de regra:

1. segunda-guerra-mundial, desfecho: a ordem dos fatos está errada (a Alemanha se rendeu antes das bombas atômicas), e "em maio" e "em setembro" são datas. Texto: "Depois do Holocausto, a Alemanha se rendeu; meses depois, após os bombardeios atômicos de Hiroshima e Nagasaki, o Japão também capitulou. Surgiram as Nações Unidas, e começou a Guerra Fria."
2. segunda-guerra-mundial, envolvidos: "eixo" nomeia o lado. Texto: "Uma aliança de democracias ocidentais, de um país asiático já invadido pelo vizinho, de um Estado comunista que antes tinha feito um pacto com o agressor e, depois, da maior potência das Américas, contra uma aliança de três potências expansionistas e seus parceiros europeus."
3. segunda-guerra-mundial, Lados: Romênia e Bulgária passaram para os Aliados em 1944 e estão sem nota. Notas: "Aderiu ao Eixo em 1940; em 1944, depois de um golpe, passou para o lado dos Aliados." (Romênia) e "Aderiu ao Eixo em 1941; em 1944, depois de um golpe, declarou guerra à Alemanha e passou para o lado dos Aliados." (Bulgária). A alternativa é retirá-las.
4. guerra-da-argelia, envolvidos: "uma frente de libertação nacional" repete o nome do participante, e a OAS não era só de colonos. Texto: "Um movimento nacionalista armado e seu exército de guerrilha contra a metrópole, que contava com auxiliares muçulmanos locais e, no fim, enfrentou também uma organização clandestina de militares e colonos contrária à independência."
5. guerra-da-argelia, estopim: "no primeiro dia de novembro" é data. Texto: "Uma onda de ataques coordenados do movimento contra alvos militares e civis em vários pontos do território abriu a guerra."
6. guerra-civil-russa, envolvidos: "uma legião tchecoslovaca" repete o nome do participante, e os exércitos camponeses aparecem no bloco dos brancos. Texto: "A força armada do novo governo revolucionário contra exércitos comandados por generais e almirantes do antigo regime, apoiados por intervenção estrangeira e por uma legião de desertores do exército austro-húngaro; exércitos camponeses, que combatiam os dois lados, e movimentos de independência também pegaram em armas."

Correções recomendadas, por imprecisão:

7. guerra-civil-russa: nota para a Legião Tchecoslovaca, que mudou de postura no fim: "Revoltou-se contra os bolcheviques e tomou a Transiberiana; no fim, declarou-se neutra e negociou com os vermelhos a saída do país." Nota de Trótski: "Como comissário da guerra, transformou a Guarda Vermelha no Exército Vermelho."
8. guerra-das-malvinas, desfecho: foram dois destróieres britânicos afundados, e quem se rendeu foi o comandante argentino. Texto: "Após o afundamento de um cruzador sul-americano e de dois destróieres europeus e de combates em terra, o comandante sul-americano se rendeu na capital das ilhas; a derrota apressou a queda da junta, e o governo vencedor ampliou sua maioria na eleição seguinte."
9. guerra-do-yom-kipur, envolvidos: trocar "com forças de outros vizinhos" por "com tropas de outros países árabes". Nota da Jordânia: "Não abriu frente própria, mas mandou brigadas para a frente síria." Dado: "Os Acordos de Camp David, de 1978, e o tratado de paz de 1979 levaram à devolução do Sinai ao Egito, concluída em 1982; foi a primeira vez que um país árabe reconheceu Israel."
10. guerra-do-afeganistao: nota da OTAN: "A partir de 2003, comandou a força internacional ISAF." No dado, tirar a menção à Wikipedia: "Morreram de 176 mil a mais de 212 mil pessoas, entre elas mais de 46 mil civis. O Paquistão, visto como aliado firme dos Estados Unidos no início da guerra, dava dinheiro, abrigo e apoio político ao Talibã."
11. guerra-russo-ucraniana, estopim: trocar "forças locais apoiadas pelo vizinho" por "milícias separatistas, apoiadas e em parte comandadas pelo vizinho". Dado atualizado para 09/11/2026: "Situação em 09/11/2026: a guerra continua, sem cessar-fogo geral nem acordo de paz; as tréguas de 2026 foram curtas ou locais e já terminaram, e a Rússia ocupa cerca de um quinto do território ucraniano. A invasão em grande escala começou em 24 de fevereiro de 2022." Rever depois das negociações de 10 e 11/11/2026 em Abu Dhabi.

Opcionais: incluir o Brasil nos Aliados da Segunda Guerra Mundial ("Declarou guerra ao Eixo em 1942 e mandou a Força Expedicionária Brasileira lutar na Itália"; fonte https://en.wikipedia.org/wiki/Brazil_in_World_War_II), o que resolve a pendência de conflitos.md; incluir a Itália no Eixo com nota sobre o armistício de 1943; tirar da pista de desfecho da Guerra Civil Russa o número de mortos da fome; precisar a nota do Chile nas Malvinas.

Sem correção: guerra-russo-japonesa.

Lacuna do teste automático: engine.test.ts compara nomes de participantes com a pista de envolvidos diferenciando maiúsculas, e procura só anos com quatro dígitos. Por isso não detectou "uma frente de libertação nacional", "uma legião tchecoslovaca", "eixo" nem as datas sem ano ("primeiro dia de novembro", "em maio", "em setembro").

## Correções aplicadas (09/11/2026)

Aplicadas em data/curated/lotes e em src/data/conflitos.json todas as correções necessárias e recomendadas acima (itens 1 a 11), com os textos sugeridos. Dos opcionais, entraram: Brasil nos Aliados da Segunda Guerra Mundial, com a nota sugerida e a fonte Brazil in World War II, o que encerra a pendência registrada em conflitos.md; Itália no Eixo, com nota sobre o armistício de 1943; desfecho da Guerra Civil Russa sem o número de mortos da fome; nota mais precisa do Chile nas Malvinas; "referendos" no plural na Guerra da Argélia. Novas fontes acrescentadas às fichas: Czechoslovak Legion, Brazil in World War II, Britannica Bulgaria/World War II e Britannica Algerian War. A ficha da Guerra Russo-Ucraniana deve ser revista depois das negociações de 10 e 11/11/2026 em Abu Dhabi. O teste de engine.test.ts passou a conferir, nas guerras em jogo, nomes de participantes sem diferenciar maiúsculas e datas com dia e mês.
