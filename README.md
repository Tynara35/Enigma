# Expedição — O segredo do baú

Jogo PWA em português, sem dependências de instalação. Dez enigmas revelam dez peças de um baú ilustrado. Inclui música ambiente sintetizada, três cartas de uso único, prêmio e tempo configuráveis, editor e importação/exportação JSON. Funciona offline depois da primeira visita completa.

## Publicar no GitHub

1. Crie um repositório no GitHub e envie **o conteúdo desta pasta**, incluindo `.github/workflows/pages.yml`, para a branch `main`.
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Na aba **Actions**, aguarde o fluxo “Publicar jogo no GitHub Pages”. Se necessário, execute-o com “Run workflow”.
4. Abra o endereço informado pelo deploy: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

Nenhum repositório foi criado ou publicado automaticamente. Todos os caminhos são relativos e suportam um subdiretório do GitHub Pages.

## Executar localmente

Com Node.js 20 ou superior, abra um terminal nesta pasta e rode `npm start`. Acesse `http://127.0.0.1:4173`. Para testar as regras: `npm test`. Não abra index.html com duplo clique: módulos e service worker precisam de um servidor HTTP local ou HTTPS.

## Instalar

No Chrome/Edge e Android, use “Instalar aplicativo” quando disponível ou o comando de instalação do navegador. No Safari do iPhone/iPad, use Compartilhar → Adicionar à Tela de Início. Em produção, HTTPS é obrigatório. A disponibilidade do botão depende do navegador. Faça uma primeira visita conectado e aguarde o carregamento antes de usar offline.

## Preparar a partida

Abra **Preparar expedição**, configure o prêmio e o tempo (5 a 3.600 segundos por pergunta), importe um JSON ou edite as perguntas. Ao editar, clique em **Salvar pergunta** e depois **Salvar preparação**. As configurações ficam somente neste navegador/dispositivo; não são sincronizadas. Exporte seu banco para backup ou para usar em outro dispositivo. Para mudar o banco inicial para todos, substitua `perguntas.json` no repositório.

São sorteadas 10 perguntas sem repetição. Cada acerto revela uma peça. Entre perguntas o cronômetro para e recomeça ao avançar. Um erro ou tempo esgotado encerra a partida. Sair da aba não pausa o relógio. Ao recarregar a página, a partida é reiniciada.

* **Sexto sentido:** mantém a correta e uma incorreta. Não se aplica a abertas ou perguntas com apenas duas opções.
* **Tome Cuidado!:** precisa ser ativada antes da resposta; permite um erro apenas na pergunta atual. Não reinicia o cronômetro nem protege do tempo esgotado. Expira ao avançar mesmo sem ter sido necessária.
* **Pegue essa tocha:** revela `hint`. Fica indisponível quando a pergunta não tem dica e não é consumida.

O JSON original fornecido contém 50 perguntas e não tem dicas. A versão incluída mantém as perguntas e respostas e acrescenta 50 dicas editáveis para que a tocha funcione desde a primeira partida. As respostas originais não passaram por revisão factual. Perguntas sobre fatos atuais podem precisar de atualização pelo organizador.

## Formato JSON

O arquivo é uma lista com pelo menos 10 perguntas. Para múltipla escolha, `correct` é o índice **começando em zero**; no editor visual, a numeração começa em 1.

```json
[
  {"type":"multiple","q":"Qual objeto ilumina uma caverna?","options":["Bússola","Tocha","Mapa","Corda"],"correct":1,"hint":"Ele produz luz com fogo."},
  {"type":"open","q":"Qual é a capital do Brasil?","answers":["Brasília","Brasilia"],"hint":"Foi inaugurada em 1960."}
]
```

O exemplo acima mostra os dois formatos; complete a lista até 10 entradas para importar. Respostas abertas aceitam uma das alternativas em `answers`, ignorando caixa, acentos e espaços repetidos, mas não fazem interpretação semântica. O campo `answer` com uma única string também é aceito. `hint` é opcional. O importador informa erros sem substituir o banco atual.

## Arquivos e manutenção

`index.html` e `style.css`: interface. `app.js`: controles, áudio e armazenamento. `engine.js`: regras testáveis. `sw.js`: cache offline. `manifest.webmanifest`: instalação. `assets/`: arte original gerada e ícones. O áudio é sintetizado no navegador e só começa por ação do usuário.

Quando publicar uma atualização, altere a versão de `CACHE` em `sw.js` (por exemplo, `expedicao-v2`). Feche todas as janelas do jogo e reabra para ativar a nova versão. Configurações locais existentes prevalecem sobre o JSON padrão.

Este é um jogo local, sem login ou servidor de validação. Respostas e prêmio podem ser vistos por alguém que inspecione os arquivos ou o armazenamento do navegador; não há proteção antifraude. A instalação real em celulares deve ser conferida após publicar o endereço HTTPS.


## Abertura 3D do baú

Após os dez acertos, clique em **Abrir o baú**. O modelo tridimensional tem corpo oco, tampa curva articulada, tábuas individuais, ferragens e sombras de contato. A câmera se aproxima discretamente, a tampa abre nas dobradiças traseiras e um pergaminho com o prêmio configurado sobe do interior. A sequência dura cerca de 5,6 segundos.

Use **Preparar expedição → Testar abertura do baú** para conferir o efeito. É possível pular a animação e a preferência de movimento reduzido é respeitada. Em navegadores sem WebGL, a imagem do baú aberto revela o prêmio sem movimento 3D.

A biblioteca Three.js 0.180.0 está incluída em `vendor/`, junto com a licença MIT; não depende de CDN durante o jogo e é armazenada para uso offline. O modelo e a animação estão em `chest-3d.js`.

A textura `assets/wood.png` foi criada com ImageGen integrado. Prompt: textura fotográfica plana e repetível de nogueira envelhecida, com veios horizontais, poros, riscos finos e manchas castanhas sutis; sem emendas, objetos, perspectiva, texto ou sombras direcionais. A arte `assets/chest-open.png` é usada como alternativa estática e mantém o estilo da imagem original do quebra-cabeça.
