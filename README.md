# 🌊⚡ API de Medição de Consumo

Este projeto é uma API de backend para gerenciar a leitura individualizada de consumo de água e gás. Utiliza a API do Google Gemini para realizar a leitura de medidores a partir de imagens, retornando os valores das medições. A aplicação está dockerizada e integra PostgreSQL como banco de dados, Prisma como ORM, e está documentada via Swagger.

## 🛠️ Tecnologias Utilizadas

- **Node.js** e **TypeScript**
- **Express**
- **Prisma ORM**
- **Zod** para validação de dados
- **PostgreSQL** como banco de dados
- **Docker** e **Docker Compose** para gerenciamento de containers
- **Swagger** para documentação de API

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** e **pnpm** (ou outro gerenciador de pacotes como npm ou yarn)
- **Docker** e **Docker Compose**

## 🌍 Variáveis de Ambiente

A aplicação pode ser configurada através de variáveis de ambiente definidas em um arquivo `.env` na raiz do projeto. Essas variáveis controlam o comportamento da aplicação e a conexão com serviços externos.

> **Atenção**: A **única variável obrigatória** para a aplicação funcionar corretamente é **`GEMINI_API_KEY`** 🔐. Todas as outras variáveis possuem valores padrão configurados para um ambiente de desenvolvimento simples.

### Principais Variáveis 🌟

- **`GEMINI_API_KEY`**: Chave da API do Google Gemini para realizar as leituras das imagens dos medidores. **(Obrigatória)** 🔑
  
- **`PORT`**: Define a porta onde a API será executada (padrão: `80`) 🔌.
  
- **`DATABASE_URL`**: URL de conexão com o banco de dados PostgreSQL no formato:
  ```
  postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}?schema=public
  ```

### Configuração do Banco de Dados 🗄️

- **`POSTGRES_USER`**: Usuário do banco de dados PostgreSQL (padrão: `root`).
  
- **`POSTGRES_PASSWORD`**: Senha do banco de dados PostgreSQL (padrão: `root`).
  
- **`POSTGRES_DB`**: Nome do banco de dados PostgreSQL (padrão: `mydb`).
  
- **`POSTGRES_HOST`**: Host do banco de dados PostgreSQL.
  - **`db`**: Quando a API é executada no Docker 🐳.
  - **`localhost`**: Quando executado localmente fora do container da API 🖥️.

- **`POSTGRES_PORT`**: Porta do banco de dados PostgreSQL (padrão: `5432`).

### Variáveis para o pgAdmin 📊

- **`PGADMIN_DEFAULT_EMAIL`**: E-mail de login do pgAdmin (padrão: `pgadmin4@pgadmin.org`) 📧.

- **`PGADMIN_DEFAULT_PASSWORD`**: Senha de login do pgAdmin (padrão: `admin`) 🔒.

### Variáveis para o Deploy 🚀

- **`URL_DEPLOY`**: URL onde a aplicação será implantada (padrão: `http://localhost:80`) 🌐.

### Exemplo de Arquivo `.env`

```env
PORT=80
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://root:root@db:5432/mydb?schema=public
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_DB=mydb
POSTGRES_HOST=db
PGADMIN_DEFAULT_EMAIL=pgadmin4@pgadmin.org
PGADMIN_DEFAULT_PASSWORD=admin
URL_DEPLOY=http://localhost:80
```

> **Lembre-se**: Se você estiver executando comandos localmente, altere a variável `POSTGRES_HOST` de `db` para `localhost` para garantir a comunicação adequada com o banco de dados.

## 📥 Clonando o Repositório

```bash
git clone https://github.com/Kaduh15/api-consumption-measurement.git
cd api-consumption-measurement
```

## 🐳 Executando com Docker

1. Execute o comando para subir os containers:
   - **Em produção**:
     ```bash
     pnpm compose:up
     ```
   - **Em desenvolvimento**:
     ```bash
     pnpm compose:up:dev
     ```

2. Isso irá criar e iniciar três containers:
   - 🌐 API (porta: 80)
   - 🗄️ Banco de Dados PostgreSQL (porta: 5432)
   - 🔧 pgAdmin para gerenciar o banco de dados (porta: 5050)

## 💻 Executando Localmente

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Configure o banco de dados e as variáveis de ambiente no arquivo `.env`.

3. Gere o cliente Prisma e aplique as migrações:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. Inicie a aplicação:
   ```bash
   pnpm dev
   ```

## 🔄 Scripts Disponíveis

- `build`: ⚙️ Compila o código TypeScript.
- `dev`: 🛠️ Inicia a aplicação em modo de desenvolvimento.
- `dev:env`: 🛠️ Inicia a aplicação em modo de desenvolvimento com variáveis de ambiente customizadas.
- `start`: 🚀 Inicia a aplicação em modo de produção.
- `start:env`: 🚀 Inicia a aplicação em modo de produção com variáveis de ambiente customizadas.
- `lint`: 🔍 Analisa o código usando ESLint.
- `db:generate`: 🛠️ Gera o cliente Prisma.
- `db:migrate`: 🔄 Aplica as migrações ao banco de dados.
- `db:studio`: 📊 Abre o Prisma Studio para gerenciar o banco de dados.
- `compose:up`: 🐳 Sobe os containers com Docker Compose em produção.
- `compose:up:dev`: 🐳 Sobe os containers com Docker Compose em desenvolvimento.
- `compose:down`: ❌ Fecha os containers com Docker Compose.
- `compose:down:dev`: ❌ Fecha os containers com Docker Compose em desenvolvimento.

## 🛠️ Solução de Problemas

### ❗ Erro de Permissão ao Subir o Banco de Dados

Caso você encontre o seguinte erro ao tentar subir o banco de dados com Docker:

```
ERROR [api internal] load build context
ERROR transferring context: 33.97kB
failed to solve: error from sender: open .../api-consumption-measurement/data: permission denied
```

Para corrigir, execute o comando abaixo:

```bash
sudo chmod -R 755 "$(pwd)/data"
```

## 📝 Endpoints

### 🔼 POST /upload

Recebe uma imagem em base64 e retorna o valor lido pela API do Google Gemini.

**Request Body**:
```json
{
  "image": "base64",
  "customer_code": "string",
  "measure_datetime": "datetime",
  "measure_type": "WATER" ou "GAS"
}
```

**Response Body**:
```json
{
  "image_url": "string",
  "measure_value": integer,
  "measure_uuid": "string"
}
```

### 🔄 PATCH /confirm

Confirma ou corrige o valor lido pela API do Google Gemini.

**Request Body**:
```json
{
  "measure_uuid": "string",
  "confirmed_value": integer
}
```

**Response Body**:
```json
{
  "success": true
}
```

### 📄 GET /{customer_code}/list

Lista todas as medições realizadas por um cliente.

## 📚 Documentação da API

A documentação completa da API pode ser encontrada na rota `/docs` quando a aplicação estiver rodando, ou no diretório `docs` na raiz do projeto.

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou enviar pull requests. Todas as contribuições são bem-vindas!
