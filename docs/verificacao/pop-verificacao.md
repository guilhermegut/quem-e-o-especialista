# Verificação independente de pop.json (Quem é o Especialista)

Data: 09/11/2026

Escopo: data/curated/quiz/pop.json, com 87 itens (30 em oscarFilme, 29 em oscarDirecao, 12 em livros e 16 em jogos) e as três afirmações da "_nota".

Método: cada ano, vencedor, diretor, autor, editora e ano de lançamento foi conferido com WebFetch, em 09/11/2026, nas URLs do campo "fontes" (Wikipedia em inglês), com perguntas restritas aos dados do item; os títulos brasileiros dos livros foram conferidos na página de cada livro na Wikipedia em português, uma por livro. Quando a fonte listada não cobria um ponto, usou-se uma única fonte adicional, indicada abaixo, e nada foi dado como confirmado com base em memória.

Limitações: o WebFetch entrega um resumo da página feito por outro modelo, não o texto bruto, e pode ler versão em cache. A página de Melhor Filme diz expressamente que "winners are listed first in the gold row"; a de Melhor Direção não traz essa frase (a marca de vencedor da legenda se perde na extração), de modo que nela o vencedor foi lido pela posição na tabela, com confirmação em prosa ou no infobox para a maioria dos anos (Traffic, Brokeback Mountain, Life of Pi, Gravity, La La Land, Roma, Nomadland, The Power of the Dog, Everything Everywhere All at Once e One Battle After Another, além das duas vitórias de Spielberg, Iñárritu, Cuarón, Eastwood e Ang Lee na lista de vencedores múltiplos). Nenhum host recusou acesso. Três URLs da Wikipedia em português montadas pelo título brasileiro deram "url_not_found" (O_Pequeno_Príncipe, E_Não_Sobrou_Nenhum e Diário_de_um_Banana); as páginas foram lidas pelos títulos originais (Le_Petit_Prince, And_Then_There_Were_None e Diary_of_a_Wimpy_Kid).

## oscarFilme

30 itens conferidos, de 1997 a 2026. Todos os vencedores batem com a fonte. A fonte organiza as tabelas pelo ano do filme e pelo número da cerimônia (por exemplo, "2025 (98th)") e não informa a data das cerimônias desse período; a fonte adicional "List of Academy Awards ceremonies" (Wikipedia em inglês) confirma que a 69ª cerimônia foi em 24/03/1997 e a 98ª em 15/03/2026, com uma cerimônia por ano entre elas, inclusive a 93ª em 25/04/2021 (filmes de 2020/21). Os anos do arquivo, portanto, correspondem ao ano da cerimônia em todos os itens. Observação sem divergência: a fonte dá o título completo "Birdman or (The Unexpected Virtue of Ignorance)"; o arquivo usa "Birdman", forma também usada na lista de cerimônias.

## oscarDirecao

29 itens conferidos, de 1998 a 2026. Diretores e filmes batem com a fonte em todos os anos, com o ano da cerimônia igual ao ano do filme mais um (confirmado pela mesma fonte adicional acima). "Joel e Ethan Coen" e "Daniel Kwan e Daniel Scheinert" correspondem a "Joel Coen and Ethan Coen" e "Daniel Kwan and Daniel Scheinert". Observação sem divergência: a lista começa em 1998, enquanto oscarFilme começa em 1997; não há item de direção para a cerimônia de 1997.

## livros

12 itens conferidos. Os 12 constam da fonte com os autores do arquivo: dez na tabela de livros individuais e dois (One Piece e Diary of a Wimpy Kid) na tabela de séries de livros. Títulos brasileiros confirmados na Wikipedia em português: O Pequeno Príncipe ("bra: O Pequeno Príncipe"; em Portugal, O Principezinho), O Alquimista (original em português), Harry Potter e a Pedra Filosofal ("Brasil e Portugal"), E Não Sobrou Nenhum ("No Brasil foi publicado como O Caso dos Dez Negrinhos e atualmente como E Não Sobrou Nenhum"), O Hobbit (no Brasil, "O Hobbit ou Lá e de Volta Outra Vez", de que o arquivo usa a forma curta), O Código Da Vinci ("no Brasil e em Portugal"), O Apanhador no Campo de Centeio ("Brasil: O Apanhador no Campo de Centeio"), O Mundo de Sofia (infobox: "O Mundo de Sofia - Romance da história da filosofia [BR]"), One Piece (publicado no Brasil pela Panini Comics, sem título diverso) e Diário de um Banana ("no Brasil: Diário de um Banana").

### Divergências

1. A Tale of Two Cities. No arquivo: título "Um Conto de Duas Cidades". Na Wikipedia em português: "A Tale of Two Cities (Brasil: Uma história em duas cidades / Portugal: Um Conto de Duas Cidades)". O título do arquivo é o de Portugal. Correção proposta: "Uma História em Duas Cidades".

2. The Little Prince. No arquivo: original "The Little Prince". Na fonte listada: "The Little Prince (Le Petit Prince)", língua original francês. O campo "original" traz o título em inglês, e o motor exibe "O Pequeno Príncipe (The Little Prince)" como se fosse o original. Correção proposta: original "Le Petit Prince".

3. The Alchemist. No arquivo: original "The Alchemist". Na fonte listada: "The Alchemist (O Alquimista)", língua original português; a Wikipedia em português: "publicado originalmente em 1988, em português". Correção proposta: original "O Alquimista", igual ao título, o que faz o motor deixar de exibir o parêntese.

4. Sophie's World. No arquivo: original "Sophie's World". Na fonte listada: "Sophie's World (Sofies verden)", língua original norueguês (a página em português grafa "Sofies Verden"). Correção proposta: original "Sofies verden".

### Não verificáveis

1. Alice no País das Maravilhas: a Wikipedia em português usa esse título como forma abreviada de "As Aventuras de Alice no País das Maravilhas", mas não indica qual título é o brasileiro e qual o português; a edição Martin Claret aparece nas referências sem local. O título é compatível com o uso no Brasil, mas a página não o rotula como brasileiro. Autor e título original estão confirmados.

### Observações

One Piece e Diário de um Banana vêm da tabela de séries de livros, não da de livros individuais; as explicações geradas pelo motor ("um dos livros mais vendidos do mundo"; "Todos estão entre os livros mais vendidos do mundo") seriam mais exatas como "uma das séries de livros mais vendidas". O título original de One Piece, segundo a página em português, é ワンピース (Wan Pīsu); como a forma romanizada coincide com o título usado no Brasil, manter "One Piece" no campo "original" não causa erro visível.

## jogos

16 itens conferidos. Título, editora (coluna "Publisher(s)") e ano de lançamento batem com a fonte em todos. As duas afirmações da "_nota" sobre jogos estão confirmadas: a fonte agrupa "Pokémon Red / Blue / Yellow" (1996, Nintendo) e "Mario Kart 8 / Deluxe" (2014, Nintendo). A fonte dá apenas o ano de lançamento, não a data. A fonte identifica o Call of Duty como "Call of Duty: Modern Warfare (2019)"; o arquivo omite o "(2019)", mas o motor mostra "Lançado em 2019" na pergunta, o que desfaz a ambiguidade.

### Divergências

Nenhuma.

### Não verificáveis

Nenhum.

### Observação fora do escopo

Não conferido em nenhuma fonte lida: se Activision aparecer como alternativa errada para Overwatch, a relação societária entre Activision e Blizzard pode tornar a pergunta discutível para o jogador. A fonte aponta só Blizzard Entertainment como publicadora, e o gabarito do arquivo segue a fonte.

## Resumo

| Bloco | Itens conferidos | Divergentes | Não verificáveis |
|---|---|---|---|
| oscarFilme | 30 | 0 | 0 |
| oscarDirecao | 29 | 0 | 0 |
| livros | 12 | 4 | 1 (parcial) |
| jogos | 16 | 0 | 0 |
| Total | 87 | 4 | 1 (parcial) |

As três afirmações da "_nota" (filmes pelo título original; agrupamento de Pokémon Red, Blue e Yellow; Mario Kart 8 com a versão Deluxe) estão confirmadas. Nenhum vencedor, diretor, ano de cerimônia, autor, editora ou ano de lançamento foi encontrado incorreto. As divergências estão todas em livros: um título brasileiro (Um Conto de Duas Cidades, que é o título de Portugal; no Brasil, "Uma história em duas cidades") e três campos "original" preenchidos com o título em inglês em vez do título na língua original (Le Petit Prince, O Alquimista, Sofies verden). O ponto não verificável é só o rótulo brasileiro de "Alice no País das Maravilhas". Fonte adicional usada: List of Academy Awards ceremonies (Wikipedia em inglês), para as datas das cerimônias.

## Correções aplicadas em 09/11/2026

"Um Conto de Duas Cidades" passou a "Uma História em Duas Cidades", título usado no Brasil. O campo original passou a trazer o título na língua original: Le Petit Prince, O Alquimista (o parêntese deixa de aparecer) e Sofies verden. One Piece e Diário de um Banana foram marcados como séries, e a explicação diz "uma das séries de livros mais vendidas". Na pergunta de videogames, Activision e Blizzard Entertainment deixaram de aparecer como alternativa errada uma da outra.
