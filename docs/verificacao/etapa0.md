# Etapa 0: reconfirmação do ambiente (06/11/2026)

Remotion no navegador: remotion e @remotion/web-renderer 4.0.541. Teste em lab/remotion (node lab/remotion/run.mjs): uma vinheta de 3 s (90 quadros, 30 fps, 1080 × 1920, globo ortográfico do d3-geo em SVG e título em Inter) renderizada por renderMediaOnWeb no Chrome headless em 3,4 s, MP4 H.264 de 1,15 MB conferido com ffprobe. canRenderMediaOnWeb respondeu sem pendências (h264 e aac disponíveis). Observações: a cada render a biblioteca envia um registro de uso para www.remotion.pro com a origem do site; com licenseKey "free-license" ela não envia chave. O Remotion 4.0.541 é desenvolvido com React 19 e, no React 18 do projeto, gera avisos de ref no console de desenvolvimento, sem efeito no vídeo; a migração para React 19 fica como pendência de acabamento.

GitHub: gh auth status falha ("The token in GH_TOKEN is invalid"). A publicação depende de o usuário conectar o repositório.

ElevenLabs: o download dos arquivos gerados pelo shell não foi testado, porque exige uma geração, que gasta créditos e depende de aprovação.

Audiência da Wikipédia (para os níveis do acervo de guerras): a API de pageviews em wikimedia.org foi recusada pelo proxy do shell (CONNECT 403). Não houve tentativa de contornar.
