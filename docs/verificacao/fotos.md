# Verificação independente do módulo Foto

Data da verificação: 10/11/2026. Entrada: `/home/claude/fotos-lab/verificacao/pacote.json` (353 itens). Decisões gravadas em `/home/claude/fotos-lab/verificacao/decisoes.json` (somente itens que não estão "ok"; item ausente = ok).

## Método

Li o pacote com Python (`python3 -I`) e conferi cada item contra a ficha do Commons incluída no próprio pacote (campo `fonte`), tratada como fonte primária. As checagens de ano, licença, autor e acervo foram automáticas sobre os 353 itens, seguidas de leitura manual de todos os casos sinalizados. Todos os 353 títulos foram lidos em blocos compactos (id, título, nome do arquivo, descrição); nos itens Anefo, os detalhes extras dos títulos foram conferidos contra o campo "Reportage / Serie". As descrições do pacote vêm truncadas em 320 caracteres, o que impediu confirmar o fotógrafo de alguns itens Anefo e o crédito completo de alguns itens do Senado.

Como a LoC ficou inacessível (ver Limitações), o risco de ano redondo nos itens Bain e Harris & Ewing foi avaliado por evidência interna. Os LCCN 2014xxxxxx do Bain seguem a ordem dos números de negativo, que é aproximadamente cronológica, e os números visíveis nas placas confirmam isso (465-5 em 1908, 2765-12 em 1913, 4359-8 em 1917). O mesmo vale, por blocos, para os LCCN 2016xxxxxx e os números hec do Harris & Ewing. Um ano fora da sequência, sobretudo quando redondo, foi tratado como não confirmado.

## Contagens por etapa

| Etapa | Itens conferidos | Resultado |
|---|---|---|
| 1. Ano | 353 automáticos; 28 sinalizados pela heurística e lidos um a um; mais 102 Bain/H&E ordenados por LCCN e hec | jogo.ano = ano da data da fonte em 353 de 353; 15 problemas reais (1 corrigir, 14 excluir) |
| 2. Licença | 353 | todas aceitáveis e com rótulo igual ao da fonte; 1 exclusão por licença de terceiro não comprovada; 2 pendências |
| 3. Autor e acervo | 353 | 16 correções de autor, 2 de acervo |
| 4. Título | 353 lidos | 4 correções |
| 5. Conteúdo | 353 por metadados; 88 fotos de 1990 em diante vistas em grade de miniaturas, 8 delas ampliadas | 7 exclusões (pessoas privadas em close, termos vulgares ou acusatórios) |
| 6. Checagem ao vivo | 22 páginas jogo.url tentadas, 0 abertas; 2 registros da LoC tentados, 0 abertos | ver Limitações |
| 7. Imagens | 15 imagens inteiras (8 Bain/H&E); faixas de topo e base das 102 Bain/H&E em folhas de contato, 10 ampliadas; 2 H&E inteiras | 7 imagens com legenda do negativo visível (5 com data legível) |

## Limitações

A checagem ao vivo não foi possível. O WebFetch abriu a página principal do Commons, mas devolveu "url_not_found" para todas as páginas de arquivo, inclusive `File:Example.jpg`, as variantes com dois-pontos codificado, `index.php?title=`, `?uselang=en`, página de categoria e a API. A versão móvel e os dois registros da LoC (`lccn.loc.gov/2016889680` e `loc.gov/item/2016889680`) ficaram bloqueados por pedido de permissão não respondido, e não repeti as tentativas. Por isso nenhum item teve data, licença ou autor confirmados contra a página viva.

Páginas tentadas (jogo.url): os 20 sorteados com semente 20261110 (f1d8f36e6, fc11349fb, ff6959ddf, faec9a633, f208c4ed2, f1bf23eb6, fc9fb3938, f9d10d629, f50d7f384, fd35e99ee, f46a53e28, ff07eb3be, ff47ecf26, fc58f01e4, f003c58e7, f601ab86c, feb399375, fb7e1b886, f0240a433, f7f9e4bc5) mais os suspeitos f9f7030d2 e f973934e5. Como substituto parcial, fiz três buscas na web. Elas confirmaram, por notícias, que a reunião Lula–Trump na Casa Branca foi em 7/5/2026 e que as enchentes da Região Serrana foram em janeiro de 2011. Não esclareceram a política de licença das fotos do Planalto. Tudo o que depende de LoC ou Commons ao vivo continua não confirmado.

## Resultado geral

Dos 353 itens, 301 ficaram sem problema encontrado, 30 pedem correção e 22 devem ser excluídos. Nenhuma licença do pacote é NC, ND, GFDL-only ou fair use, e nenhum item tem restrição de personalidade registrada. Os problemas mais graves estão nos anos dos itens Bain e Harris & Ewing que o Commons data só com um ano redondo, e nas legendas de negativo com data que o corte de 8% do topo não removeu. A recomendação geral para o corte é subir o topo do Bain para cerca de 13% e verificar também a base: nas 102 placas, 7 ainda mostram legenda.

## Itens com problema

### Ano

| id | Problema | Evidência | Recomendação |
|---|---|---|---|
| f9f7030d2 | Ano 2010 incompatível com o evento | Data 2010-12-22, mas a descrição fala da feira esvaziada pela "tragédia das enchentes" e o crédito é a galeria ABr de 2011-01-22 | Corrigir para 2011 (sustentado pelo crédito) |
| f973934e5 | Data e crédito discordam | Data 2012-02-21 e categorias 2012; crédito: galeria ABr 2014-03, "primeiro dia de desfiles" | Excluir |
| fde4d0b74 | Categorias discordam da data | Data 2014-03-04 e crédito 2014-03; categorias "Carnival 2012" e "Estácio de Sá in 2012" | Excluir |
| f96799ed5 | Categoria de outro ano | Data 2008-02-02; categoria "Festa de Iemanjá no Rio Vermelho 2024"; quase duplicata de f67f92025 | Excluir |
| fc33dbd0c | Data inferida | Descrição: "muito provavelmente" no desfile de 1º/5/1909 | Excluir |
| f9b32f434 | Reprodução | "Annotatie: Repronegatief"; foto de Fritz Basch; a data pode ser a da reprodução | Excluir |
| f1a65e309 | 1901 fora da sequência | LCCN 2014690455 entre negativos de 1912 | Excluir |
| f7e4160e2 | 1910 fora da sequência | LCCN 2014691612 entre negativos de 1913; tema compatível com a enchente de Dayton de 1913 | Excluir |
| f645b08c2 | 1910 fora da sequência | LCCN 2014692192 entre negativos de 1913; hidroavião de casco da Curtiss em 1910 é anacrônico | Excluir |
| fd23da02c | 1910 fora da sequência | LCCN 2014698972 entre negativos de 1914 e 1915 | Excluir |
| fe66a9d60 | 1915 fora da sequência | LCCN 2014707541 entre negativos de 1917 e dez/1918 | Excluir |
| fdf3c52f4 | 1915 fora da sequência | LCCN 2014708307 depois de 26/12/1918; negativo nº 4817-2, maior que o de 1917 (4359-8) | Excluir |
| f7176fe25 | 1915 fora da sequência | LCCN 2014710131 depois dos negativos de 1919 | Excluir |
| f6af3e1ea | 1905 anacrônico | Prédio dos anos 1920 com vitrine "NEW ... SPORT $1395.00"; a Oakland foi fundada em 1907; padrão [1905-1945] do catálogo H&E | Excluir |
| f78621065 | 1929 não sustentado | LCCN 2016890631 e hec.41302 no bloco 1921–1925; imagem com carruagens e carro do início dos anos 1920 | Excluir |

### Licença

| id | Problema | Evidência | Recomendação |
|---|---|---|---|
| f5f9831f5 | Licença de terceiro | Autor "Divulgação Petrobras / ABr"; a CC BY 3.0 BR da Agência Brasil não cobre material de divulgação de terceiros | Excluir |

### Autor e acervo

| id | Campo | Problema | Evidência | Recomendação |
|---|---|---|---|---|
| f3b37070f, f3680ca16 | autor | Jogo diz "Anefo (autor não identificado)" | Descrição: "Fotograaf : Sagers, Harry / Anefo" | Harry Sagers |
| f8c992987, f3d890f49 | autor | idem | "Fotograaf : Pot, Harry / Anefo" | Harry Pot |
| f9057bbc7, f43b55709 | autor | idem | "Fotograaf : Noske, J.D. / Anefo" | J.D. Noske |
| f61b086ee | autor | idem | "Fotograaf : Oorschot, […] van / Anefo" | van Oorschot |
| f1d8f36e6 | autor | idem | "Fotograaf : Winterbergen, […] / Anefo" | Winterbergen |
| f906860b2 | autor e imagem | idem; a imagem inclui bordas de papel impresso | "Fotograaf : Marine Voorlichtingsdienst" | Marine Voorlichtingsdienst; recortar bordas |
| f11ab8f8e | autor | CC BY 2.0 creditada à instituição | Descrição: "Foto : Cadu Gomes/VPR" | Cadu Gomes/VPR |
| f193995dd | autor | CC BY 2.0 creditada à conta do Flickr | Descrição: "Photo credit: Scott Kouchi" | Scott Kouchi (Real Estate Japan) |
| f67b2b495 | autor | Texto truncado (CC BY-SA) | "Chris McKenna ( Thryduulf" | Chris McKenna (Thryduulf) |
| f3352608a | autor | Texto truncado (CC BY-SA) | "mattbuck ( category" | mattbuck |
| f5e8dad3d | autor | Texto truncado | "Koen Suyk (ANEFO" | Koen Suyk |
| f0fadea55 | autor | Forma de catálogo | "Lee, Russell, 1903-1986" | Russell Lee |
| f49f9e1b6 | autor | Forma invertida (CC BY-SA) | "Croes, Rob C." | Rob C. Croes |
| ff51e57c9 | acervo | Atribuída à Agência Brasil | Autor "Ricardo Stuckert/PR" | Presidência da República |
| fa4dad270 | acervo | Atribuída à LoC | Crédito: "FSA photo by Ben Shahn via digitalcollections.nypl.org" | New York Public Library (foto da FSA) |

### Título

| id | Problema | Evidência | Recomendação |
|---|---|---|---|
| f50d7f384 | Título contradiz a fonte | Fonte: o cientista "escuta" os sinais do motor "em vez de uma transmissão de rádio"; o jogo diz "testa o rádio" | "Cientista do Bureau of Standards escuta o motor de um automóvel para estudar a detonação do combustível" |
| fcf44bd77 | Título não bate com a imagem | Não há soldados na foto, só o terminal vazio (letreiro "Terminal São Torquato") | "Terminal São Torquato vazio, em Vila Velha (ES)" |
| f025040c5 | Lugar errado | Nota da LoC na descrição: First National Bank of Crafton, Pensilvânia | "O carro usado no assalto a um banco de Crafton, na Pensilvânia" |
| fe66969ef | Título entrega a resposta | "Exposição de 1908" aponta 1907 | "Praia Vermelha, no Rio, com os terrenos de uma futura exposição" |

### Imagem (legenda do negativo visível)

| id | Texto visível | Recomendação |
|---|---|---|
| f9f16c376 | "KATH. STINSON 5/13/16" (topo) | Recortar mais ~5% do topo |
| fb4926515 | "1907" (topo, à direita) | Recortar mais ~6% do topo |
| f61c68502 | "(SERVICE No.3030) TAFT CROWD MITCHELL 9/24/08" (topo) | Recortar mais ~6% do topo |
| fb29b50e0 | "PEACE PARADE 8/29/14" (topo) | Recortar mais ~5% do topo |
| f99025e9a | "PARIS FASHION 1914" (base) | Recortar ~12% da base |
| f6153cf44 | Resto fraco e espelhado de "SUFFRAGE PARADE WASH 3 3 13" (topo) | Recortar mais ~5% do topo |
| f807c5152 | Resto de legenda cortada, com números à direita (topo) | Recortar mais ~5% do topo |

### Conteúdo

| id | Problema | Recomendação |
|---|---|---|
| f179af390 | 2018: pessoas privadas identificáveis em primeiro plano em manifestação política; cartaz com termo vulgar | Excluir |
| fc6694701 | 2016: close de torcedores privados | Excluir |
| f601ab86c | 2010: rostos de torcedores privados em close, com uma criança | Excluir |
| f4f8e7b1d | 2010: vendedor ambulante privado, identificável e nomeado, como foco | Excluir |
| f74072dc0 | 1992: close de jovens privados (caras-pintadas); imagem histórica, decisão editorial | Excluir |
| f66fe46f4 | Cartaz com palavrão em destaque ("Belo Monte de merda"); decisão editorial | Excluir |
| ff3aad80d | Faixa chamando políticos nomeados de "asesinos"; decisão editorial | Excluir |

## Pendências não confirmadas

Estes itens não entraram no decisoes.json porque não há evidência de erro, mas não puderam ser confirmados sem a página viva.

ff51e57c9 e feafae93a têm "Public domain" na fonte, o que é pouco usual: o primeiro é uma foto da Presidência de 2026, o segundo é de 1994, de fotógrafo de agência privada (A2 Fotografia). Convém conferir na página qual é a base do domínio público antes de publicar. Em ff51e57c9 o crédito diz "(2026/04/07)" e a data diz 2026-05-07; o ano não muda.

fe0f24ad3 (1921) tem LCCN depois do bloco de 1925, mas o tema (casa de Woodrow Wilson, ocupada a partir de 1921) é compatível com 1921–1924. f36ee07ba (1920) e f9c51f4d4 (1930) têm ano redondo sem sequência que permita testar.

Os outros 82 itens Bain/H&E datados só com o ano são coerentes com a sequência interna, mas não foram confirmados no catálogo da LoC.

Em f2268fe4d e fc3ffe567 (Senado, CC BY 2.0), a descrição cita o fotógrafo, mas o texto do pacote está truncado ("Foto: Ma…"). Em fc16ea9b4 o autor é só "Agência Brasil". Nos três casos, vale completar o crédito a partir da página.

## Observações sem ação

ff0770dd6 tem só data de upload (17/11/2006). O ano 2006, porém, fica fixado pelo próprio evento, já que a colisão do voo Gol 1907 foi em 29/09/2006. A imagem mostra apenas o slide da apresentação, sem vítimas.

f692e5e4d também tem data de upload, mas a descrição diz que a foto é de 10/06/2005.

f61c68502 traz "9/24/08" no negativo e 1908-09-29 no Commons; o ano não muda.

fa67a2559 mostra cartazes com retratos de mortos e desaparecidos políticos, sem conteúdo gráfico. Fica a critério editorial.

Há três pares de títulos idênticos (fc48a916f/fa14d3963, f95d935f5/f62b34610, fddc5ef02/fcf243865).

Em 46 itens mantidos, o nome do arquivo, e portanto a URL, contém o ano da resposta. Se o jogo mostrar a URL antes da resposta, isso vaza a resposta.

## Correções aplicadas

Aplicadas em 10/11/2026, por quem montou o acervo, a partir de decisoes.json:

- Os 22 itens marcados para exclusão saíram do jogo, inclusive os três de decisão editorial (cartazes com palavrão ou acusação nominal e a foto dos caras-pintadas).
- Saíram também, por cautela, os dois itens com "Domínio público" estranho (ff51e57c9, feafae93a), os três de ano duvidoso sem evidência suficiente (fe0f24ad3, f36ee07ba, f9c51f4d4) e f906860b2, que pedia recorte manual das bordas.
- As 28 correções restantes de ano, título, autor e acervo foram aplicadas com o valor proposto (f9f7030d2 passa a 2011).
- O corte das fotos Bain subiu para 13% no topo e 5% na base; o das Harris & Ewing, para 10% e 4%; f99025e9a tem 12% de corte na base. As sete imagens apontadas foram revistas depois do novo corte e não mostram mais datas legíveis.
- A URL com o ano só aparece no fim da rodada, junto com a resposta.

Acervo final: 325 fotos. A checagem ao vivo das páginas do Commons e da Library of Congress não pôde ser feita nesta rodada (as ferramentas não abriram as páginas de arquivo); os dados conferidos vêm da API do Commons, lida no mesmo dia.
