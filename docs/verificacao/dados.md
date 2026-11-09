# Dados do GeoDuelo: fontes, regras e correções

Gerado por scripts/build-data.mjs em 2026-11-06. Versão de conteúdo: d2.

## Fontes e licenças

| Pacote | Versão | Uso | Licença |
| --- | --- | --- | --- |
| world-atlas | 2.0.2 | polígonos dos países e terras (Natural Earth 1:50m) | ISC; Natural Earth em domínio público |
| world-countries | 5.1.0 | códigos ISO, ONU, região, área, idiomas | ODbL 1.0 (atribuição e compartilhamento pela mesma licença) |
| all-the-cities | 3.1.0 | cidades, coordenadas e população | MIT; dados do GeoNames, CC BY 4.0 |
| flag-icons | 7.6.0 | SVGs das bandeiras (4x3) | MIT |
| cldr-core, cldr-localenames-full, cldr-dates-full | 49.0.0 | nomes de países e de cidades em pt-BR, população e PIB (PPC) estimados | Unicode License v3 |

## Correções e decisões

- Nomes de países: CLDR 49 "pt" (pt-BR). world-countries e i18n-iso-countries foram descartados para nomes: usam português de Portugal (Irão, Quénia, Polónia) e o i18n-iso-countries 7.14.0 troca os nomes dos dois Congos.
- Variantes do CLDR usadas: CD = "República Democrática do Congo" (o nome-base é "Congo - Kinshasa"); HK e MO na forma curta ("Hong Kong", "Macau"). PS fica na forma-base, "Territórios palestinos", por decisão do usuário.
- Jerusalém entra no sorteio sem rótulo de país, por decisão do usuário (soberania contestada).
- world-countries 5.1.0 marca o Vaticano (VA) como membro da ONU. A Santa Sé é Estado observador; o pipeline corrige para 193 membros.
- GeoNames ainda nomeia a capital do Cazaquistão como "Nur-Sultan"; corrigido para Astana.
- Excluídas do sorteio: .
- Tuvalu não tem polígono na escala 1:50m e não entra como alvo de país no mapa.
- Bairros e subúrbios: descartado o lugar a menos de 12 km de uma cidade mais populosa do mesmo país, ou a menos de 30 km de uma metrópole de 3 milhões+ quando não é sede administrativa (código PPL). 638 descartados, além dos códigos PPLX, PPLQ, PPLH, PPLL e PPLS.

## Critério de "conhecidos" (nível Observador)

Membros da ONU entre os 50 mais populosos ou os 50 maiores PIBs (PPC) segundo o CLDR 49.0.0, mais os países da América do Sul e os de língua oficial portuguesa. Total: 77 países.

Afeganistão, África do Sul, Alemanha, Angola, Arábia Saudita, Argélia, Argentina, Austrália, Áustria, Bangladesh, Bélgica, Bolívia, Brasil, Cabo Verde, Canadá, Cazaquistão, Chile, China, Colômbia, Coreia do Sul, Egito, Emirados Árabes Unidos, Equador, Espanha, Estados Unidos, Etiópia, Filipinas, França, Gana, Guiana, Guiné Equatorial, Guiné-Bissau, Iêmen, Índia, Indonésia, Irã, Iraque, Irlanda, Israel, Itália, Japão, Malásia, Marrocos, México, Mianmar (Birmânia), Moçambique, Nepal, Nigéria, Noruega, Países Baixos, Paquistão, Paraguai, Peru, Polônia, Portugal, Quênia, Reino Unido, República Democrática do Congo, Romênia, Rússia, São Tomé e Príncipe, Singapura, Sudão, Suécia, Suíça, Suriname, Tailândia, Tanzânia, Tchéquia, Timor-Leste, Turquia, Ucrânia, Uganda, Uruguai, Uzbequistão, Venezuela, Vietnã

## Exônimos em português

Ordem de precedência: tabela abaixo (Wikipédia em português); exônimos do Natural Earth revisados para pt-BR (data/curated/exonimos-ne.json, com a lista do que foi aceito, adaptado e recusado); cidades-exemplo de fuso horário do CLDR 49 pt, aplicadas só à cidade mais populosa com aquele nome; nome do GeoNames sem marcas de transliteração.

| GeoNames | Nome usado | Fonte |
| --- | --- | --- |
| Sanaa | Saná | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Ankara | Ancara | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Saint Petersburg | São Petersburgo | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Nizhniy Novgorod | Nizhny Novgorod | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Kyiv | Kiev | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Pretoria | Pretória | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| New Delhi | Nova Déli | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Kathmandu | Catmandu | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Yekaterinburg | Ecaterimburgo | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Nur-Sultan | Astana | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Hanoi | Hanói | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Beijing | Pequim | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Canberra | Camberra | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Bern | Berna | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |
| Munich | Munique | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Köln | Colônia | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Hamburg | Hamburgo | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Turin | Turim | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Milan | Milão | https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa |
| Nay Pyi Taw | Naypyidaw | https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais |

Cidades no sorteio (100 mil+ habitantes): 3628; com nome do CLDR: 84; com exônimo do Natural Earth: 124.

Marcas de transliteração removidas em 285 nomes do GeoNames. Exemplos: Xi’an → Xian; Tai’an → Taian; Sūrat → Surat; Ludhiāna → Ludhiana; Kalyān → Kalyan; Ghāziābād → Ghaziabad; Rājkot → Rajkot; Solāpur → Solapur; Abū Ghurayb → Abu Ghurayb; Kahrīz → Kahriz; Alīgarh → Aligarh; Muzaffarābād → Muzaffarabad.
