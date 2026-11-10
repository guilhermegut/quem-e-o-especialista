# Verificação independente das fotos de fatos históricos do módulo Foto

Data da verificação: 10/11/2026. Entrada: `/home/claude/fotos-lab/verificacao/pacote_hist.json` (104 itens, anos de 1901 a 2026). Decisões gravadas em `/home/claude/fotos-lab/verificacao/decisoes_hist.json`, só para itens com problema; item ausente do arquivo está aprovado.

## Método

Li o pacote com Python (`python3 -I`) e conferi cada um dos 104 itens contra a ficha do Commons que vem no próprio pacote (campo `fonte`), tratada como fonte primária. Para cada item comparei o ano do jogo com a data da ficha e com a data do fato retratado. Para as datas de eventos usei conhecimento geral, e digo isso quando ele sustenta uma decisão. Também comparei licença, autor e acervo com a licença, o autor e o crédito da ficha, e o título com a descrição e as categorias. Por fim, procurei conteúdo sensível e restrições de direitos de personalidade (6 itens trazem a restrição "personality").

Abri 26 imagens com o leitor de imagens: a amostra de 20 pedida (fd43d4340, fc9569df1, f66c0f863, f2c016e05, fc79a674e, f675bb830, f594a418b, f82594bc5, f95377d15, f3813c207, f6cb21318, fb58e1a58, f8b8110d0, fdd9cea95, f98a1b23d, f0ef96374, fc7d611e6, fd5d9a6ef, fad52fd1a, f2cd6e5fb), mais seis em que o risco de texto com o ano era maior (f3619f4af, f1b21d667, fb3e9a3b8, f790dba6f, f45c3e621, f96922154). Nos casos duvidosos, ampliei trechos da imagem por recorte. Não abri páginas de arquivo do Commons. Na web, usei WebSearch e, para alguns pontos, cópias espelhadas de páginas de arquivo (download.osmand.net, fr.vikidia.org, wiki.riteme.site) e o verbete "Henry Ries" da Wikipedia em inglês.

Limitações. O campo de licença da ficha diz apenas "Public domain", sem o modelo (PD-USGov, PD-old etc.), de modo que a base do domínio público foi inferida do autor, do crédito, da data e do país. As descrições do pacote vêm truncadas em 400 caracteres. As 78 imagens fora da amostra não foram vistas, então nelas não está descartado texto visível com o ano.

## Contagens

Dos 104 itens, 75 estão sem problema, 17 precisam de correção e 12 devem ser excluídos. As correções se dividem em 13 de autor (7 de atribuição errada ou incompleta e 6 de texto truncado ou mal formatado), 2 de título, 1 de acervo e 1 de imagem. As exclusões se dividem em 7 por licença (base do domínio público fraca, não declarada ou contraditória, ou termos conflitantes), 2 por ano (intervalo vago e data de divulgação no lugar da data da observação), 2 por imagem (texto que entrega o ano, num caso com marca d'água) e 1 por conteúdo (pessoas privadas identificáveis em foto recente).

## Resultado

O conjunto é sólido quanto aos anos: fora dos dois casos excluídos, todos os anos do jogo coincidem com a data da ficha e com a data conhecida do evento. Em Tutancâmon (fe392111f) a descrição completa, lida numa cópia espelhada, fixa as fotos entre 18 e 27 de dezembro de 1922. Os problemas se concentram na licença de fotos de agências e governos estrangeiros e na transcrição do autor. Neste caso o jogo às vezes copiou o nome da conta do Flickr ou do usuário que digitalizou a imagem, ou cortou o texto no meio. Na amostra de imagens, todas mostram o que o título diz. Três trazem texto que entrega o ano: o número de peito de Bolt, o painel da COP21 e a legenda impressa da foto de Ghiggia.

## Itens com problema

| id | campo | problema | evidência | recomendação |
|---|---|---|---|---|
| f39e48856 (Chamberlain, Munique, 1938) | licença | Licença e base contraditórias | A ficha dá CC BY-SA 4.0, mas o autor diz "Public domain photo according to Narodowe Archiwum Cyfrowe", sem fotógrafo nem estúdio; é foto de imprensa britânica | Excluir |
| fc79a674e (Tribunal de Nuremberg) | ano, título | Data vaga e evento provavelmente outro | Data 1946-01-01/1949-12-31; autor é o Office of the Chief of Counsel for War Crimes (julgamentos subsequentes); na imagem só há a bandeira dos EUA atrás dos juízes, o que não corresponde ao tribunal dos principais líderes nazistas | Excluir |
| f675bb830 (gol de Ghiggia, 1950) | imagem | Texto com o ano e marca d'água | Legenda na base "...DEL MUNDIAL DE 1950 EN MARACANÁ"; marca d'água translúcida de veículo de imprensa no centro | Excluir (ou trocar por digitalização limpa) |
| f96922154 (Ponte Aérea de Berlim) | licença | Base de obra do governo dos EUA contrariada | Autor "Henry Ries / USAF", mas Ries era fotógrafo do New York Times desde 1947 (Wikipedia) | Excluir |
| f594a418b (balcão da coroação, 1953) | licença, acervo | Base do domínio público não demonstrada | Autor genérico "UK government"; o crédito é o aviso padrão da Library and Archives Canada; nada sustenta o acervo "Governo do Reino Unido" | Excluir |
| fba24c15f (debate Kennedy x Nixon) | licença | Agência privada, base não declarada | Autor UPI; crédito "eBay photo front back" (domínio público dependeria de falta de aviso de copyright) | Excluir |
| f4edfaaf3 (Beatles no JFK) | licença | Agência privada, base não declarada | Autor UPI; o crédito da LoC diz que "does not indicate the copyright status"; restrição de personalidade | Excluir |
| f8b8110d0 (COP21) | imagem | Texto com o ano | Painel ao fundo com "Conférence sur les Changements Climatiques 2015" e "COP21/CMP11 Paris" em dois pontos, logo acima das cabeças | Excluir |
| f98a1b23d (eclipse em Rexburg, 2017) | conteúdo | Pessoas privadas em primeiro plano | Três rostos identificáveis numa foto de 2017; restrição de personalidade na ficha | Excluir |
| fbbe8ffad (buraco negro M87) | ano | Data de divulgação no lugar da data da foto | Ficha 2019-04-10 (eso1907a); as observações do EHT são de abril de 2017 (conhecimento geral) | Excluir |
| f5b65fdae (funeral de Elizabeth II, 2022) | licença | Base do domínio público fraca | Foto de 2022 sob Crown copyright; a única base é a Public Domain Mark aplicada pelo DCMS no Flickr (cópia espelhada da página); a PDM não é licença nem renúncia | Excluir |
| fdf55383e (Coreia x Uruguai, 2022) | licença | Termos conflitantes | CC BY-SA 2.0, mas a descrição restringe o uso a "news organizations and/or for public purposes" | Excluir |
| f45c3e621 (Bolt em Pequim) | imagem | Texto com o ano | "Beijing 2008" legível no número de peito (conferido com ampliação) | Corrigir: desfocar ou cobrir a faixa do número de peito |
| fc0a73a27 (Truman e a OTAN) | título | Fato não sustentado ("lei") | A descrição diz "document implementing the North Atlantic Treaty" | Corrigir para "Truman assina o documento que põe em vigor o Tratado do Atlântico Norte" |
| f2cd6e5fb (eclipse em Cleveland) | título | Imagem é montagem | Arco com as fases do eclipse em várias exposições; categoria "Solar eclipse series" | Corrigir para "Montagem com as fases do eclipse solar sobre a Terminal Tower, em Cleveland" |
| fc9569df1 (linha de montagem da Ford) | acervo | Acervo genérico quando a ficha indica a instituição | O crédito aponta catalog.archives.gov/id/1633486 | Corrigir para "National Archives dos EUA" |
| f27779979 (Exposição de St. Louis) | autor | Autor do livro, não da foto | Ficha: "David R. Francis (book author)" | Corrigir para "Autor não identificado" |
| f5319f16d (Marcha do Sal) | autor | Digitalizador, não fotógrafo | Ficha: "Yann ( talk )"; crédito "Scanned by Yann" | Corrigir para "Autor não identificado" |
| f8ba12fde (posse de Roosevelt) | autor | Nome da conta do Flickr | "USCapitol"; a descrição diz "official Architect of the Capitol photograph" | Corrigir para "Arquiteto do Capitólio dos EUA" |
| f268bc3a6 (Unity e Zarya) | autor | Nome da conta do Flickr | "NASA on The Commons" | Corrigir para "NASA" |
| f3813c207 (Lula e FHC, 2003) | autor | Fotógrafa omitida | Descrição: "Foto: Jane de Araújo/Agência Senado" | Corrigir para "Jane de Araújo/Agência Senado" |
| f688f4099 (resgate no Chile) | autor | Crédito obrigatório omitido | Descrição: "MANDATORY CREDIT: HUGO INFANTE/GOVERNMENT OF CHILE" | Corrigir para "Hugo Infante/Governo do Chile" |
| fdd9cea95 (abertura da Rio 2016) | autor | Fotógrafo omitido | Descrição: "(Fernando Frazão/Agência Brasil)" | Corrigir para "Fernando Frazão/Agência Brasil" |
| ff18f1449 (Tratado de Versalhes) | autor | Texto copiado em inglês | "Helen Johns Kirtland and Lucian Swift Kirtland (died 1965)" | Corrigir para "Helen Johns Kirtland e Lucian Swift Kirtland" |
| fa55eb395 (Ialta) | autor | Texto truncado | "...Collection in the U.S. National" | Corrigir para "U.S. Army Signal Corps" |
| f775ee26e (Gagarin na Finlândia) | autor | Texto truncado e misturado com acervo | "Arto Jousi / /Suomen valokuvataiteen museo / Alma Media / Uuden Suomen" | Corrigir para "Arto Jousi" |
| fe454401b (Reagan em Berlim) | autor | Texto truncado | "President (1981-1989 : Reagan). White House Photographic Office. 1981-" | Corrigir para "White House Photographic Office" |
| f6a5a33e5 (autorretrato do Curiosity) | autor | Texto truncado | "...Malin Space Science Systems Derivative work including" | Corrigir para "NASA/JPL-Caltech/MSSS" |
| ff0197fc9 (Plutão) | autor | Texto truncado | "...Applied Physics Laboratory / Southwest" | Corrigir para "NASA/JHUAPL/SwRI" |

## Ressalvas sem ação

Alguns itens passaram, no ponto indicado, com ressalvas que não justificam ação; ficam registradas aqui para transparência (dois deles têm, além disso, correção de autor na tabela acima). Na multidão em Wall Street (f3dd273fe), a foto é da AP, mas o domínio público decorre da data: obra publicada nos EUA em 1929, em domínio público desde 2025. Em Lenin (f66c0f863), o crédito é a agência comercial Scala, mas o autor, Grigory Goldstein (1870–1941), morreu antes de 1943; as datas foram conferidas numa cópia espelhada de outra foto do mesmo autor, que cita o art. 1281 do Código Civil russo. No traslado de Vargas (f90edab08), a foto do Correio da Manhã de 1954 está em domínio público no Brasil desde 1º/1/2025, pela regra de 70 anos da Lei 9.610/98. Em Gagarin (f775ee26e), a ficha não declara a base; a regra finlandesa de 50 anos para fotografias simples a sustenta (conhecimento geral), apesar da origem num acervo de jornal. Na posse de Roosevelt (f8ba12fde), a descrição restringe o uso comercial, mas é obra federal dos EUA, e o aviso não cria direito autoral. Em Ben-Gurion (f5fa1442d), a licença CC BY-SA 3.0 vem do GPO de Israel, embora o fotógrafo, Rudi Weissenstein, fosse privado; pela lei israelense, a foto de 1948 já estaria em domínio público. No Atomium (fa53d22b2), a CC0 foi dada pela família do fotógrafo como "own work". Em Leão XIV (fad52fd1a), a fonte é um post no X, mas uma cópia espelhada da página registra permissão arquivada no VRT (ticket 2025050910008698).

Duas observações são de ordem editorial. Bento XVI (ff622fcfe) tem título sem evento, e o ano é difícil de inferir dentro do pontificado. Os enfeites da coroação de Charles III no Asda (f0ef96374) são um fato fraco e trazem sinalização comercial em destaque. Nas bandeirolas há texto, provavelmente com a data, ilegível na resolução do jogo.

Em alguns itens a data da ficha difere da data do evento por poucos dias, sem efeito no ano. É o caso da Constituição de 1988 (f82594bc5, ficha 2/10, promulgação em 5/10), do Pan de 2007 (f790dba6f, ficha 14/7, abertura em 13/7), do Sojourner (f90c93234, data de publicação de dezembro de 1997) e do eclipse em Cleveland (f2cd6e5fb, Exif de 10/4, eclipse em 8/4). No Titanic (fd43d4340), a data de 9/4/1912 vem de um site de entusiastas e não foi confirmada de forma independente; ela é compatível com o título, porque o navio ficou em Southampton de 4 a 10 de abril (conhecimento geral).

## Correções aplicadas (10/11/2026)

As 12 exclusões e as correções de autor, acervo e título de decisoes_hist.json foram aplicadas por fotos-lab/monta_h.py. A correção de imagem do Bolt (f45c3e621) ficou sem efeito, porque a foto saiu pela regra abaixo.

Além do que a verificação pediu, saíram do jogo as fotos que têm como tema uma figura pública identificável (chefes de Estado, políticos, artistas, atletas, membros da realeza e afins), nas fotos históricas e nas do cotidiano: 29 históricas e 42 do cotidiano, listadas em fotos-lab/ajustes_publicos.json. Ficaram as cenas de evento em que ninguém é o foco (multidões, plenários, estádios) e as fotos em que a pessoa não aparece de modo reconhecível (o astronauta da Apollo 11, de viseira; aviões em voo). Nessas, e em cinco fotos do cotidiano com particulares nomeados, o título passou a descrever a cena sem o nome. Também saíram a posse de Roosevelt (f8ba12fde), que além disso tem anotação manuscrita no canto, e os enfeites da coroação de Charles III (f0ef96374), pela ressalva editorial acima.

Numa conferência visual das 63 históricas restantes, feita por quem montou o acervo, só uma mostrava o ano: a manifestação de estonianos em Petrogrado (fc9a8e18a) traz a data impressa na legenda do cartão-postal, que foi recortada. O texto pequeno não foi lido nessa conferência, feita com miniaturas.

Resultado: 345 fotos, 283 do cotidiano e 62 de fatos históricos.
