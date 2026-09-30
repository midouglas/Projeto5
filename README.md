# Cálculo de Média

Aplicação Web desenvolvida com **Node.js + NPM, sem frameworks**, que recebe pela URL as notas P1 e P2, calcula a média e informa a situação final do aluno.

## Regra de cálculo

```
MEDIA = (P1 + P2) / 2
```

| Média          | Situação  | Página aberta           |
|----------------|-----------|-------------------------|
| MEDIA >= 6.0   | APROVADO  | `public/aprovado.html`  |
| MEDIA < 6.0    | REPROVADO | `public/reprovado.html` |

As páginas exibem P1, P2, média final e situação do aluno.

## Estrutura do projeto

```
├── app.js              # Servidor HTTP (módulos nativos http, fs e path)
├── package.json
├── package-lock.json
└── public/
    ├── index.html      # Formulário para digitar as notas
    ├── aprovado.html   # Resultado: aprovado
    ├── reprovado.html  # Resultado: reprovado
    ├── erro.html       # Notas não informadas ou inválidas
    ├── 404.html        # Página inexistente
    └── style.css
```

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) instalado.

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000`.

## Exemplos de acesso

| URL | Resultado |
|-----|-----------|
| `http://localhost:3000/media?p1=7.5&p2=5.0` | Média 6.25, **APROVADO** |
| `http://localhost:3000/media?p1=4&p2=6` | Média 5.00, **REPROVADO** |
| `http://localhost:3000/media?p1=7` | Erro: nota não informada |
| `http://localhost:3000/media?p1=abc&p2=5` | Erro: valor não numérico |
| `http://localhost:3000/media?p1=11&p2=5` | Erro: nota fora do intervalo 0 a 10 |
| `http://localhost:3000/qualquer-coisa` | Página 404 |
| `http://localhost:3000/` | Formulário para digitar as notas |

## Tratamentos realizados

- **Notas não informadas:** se `p1` ou `p2` estiver ausente ou vazio, o servidor responde com status 400 e a página de erro.
- **Valores inválidos:** notas não numéricas ou fora do intervalo de 0 a 10 também geram status 400. Notas com vírgula (ex.: `7,5`) são aceitas.
- **Páginas inexistentes:** qualquer rota não reconhecida responde com status 404 e a página `404.html`.

## Como funciona

O `app.js` usa o módulo `http` para criar o servidor e o `URL` para ler os parâmetros da query string. Depois de calcular a média, lê o arquivo HTML correspondente com `fs.readFile` e substitui os marcadores `{{p1}}`, `{{p2}}`, `{{media}}` e `{{situacao}}` pelos valores calculados antes de enviar a resposta.
