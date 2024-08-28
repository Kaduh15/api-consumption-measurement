Na rota **POST /upload**, o objetivo é receber uma imagem em formato base64 e utilizar uma API de LLM (como a Google Gemini) para extrair uma leitura numérica (medição) da imagem. Aqui está um resumo do que você precisa fazer para implementar essa rota:

### **Requisitos da Rota POST /upload**
1. **Receber a Imagem em Base64**:
   - A rota deve aceitar uma imagem enviada no corpo da requisição em formato base64.
   - Junto com a imagem, devem ser fornecidos outros dados importantes, como `customer_code`, `measure_datetime`, e `measure_type`.

   **Request Body**:
   ```json
   {
     "image": "base64",
     "customer_code": "string",
     "measure_datetime": "datetime",
     "measure_type": "WATER" ou "GAS"
   }
   ```

2. **Validar os Dados**:
   - **Validar o tipo de dados**: Certifique-se de que os parâmetros fornecidos são válidos (ex: imagem em base64, datetime no formato correto, customer_code como string, etc.).
   - **Verificação de duplicidade**: Antes de prosseguir, verificar se já existe uma leitura no mês para o tipo de medida (`measure_type`). Se já houver, deve retornar um erro 409 (`DOUBLE_REPORT`).

3. **Integração com a API do Google Gemini**:
   - A imagem em base64 deve ser enviada para a API do Google Gemini, que retornará um valor numérico extraído da imagem.
   - O valor numérico retornado, juntamente com um link temporário para a imagem e um GUID (identificador único), deve ser enviado na resposta da requisição.

4. **Resposta da Rota**:
   - Se a operação for bem-sucedida, a rota deve retornar um status code 200 e um JSON com os seguintes dados:
     ```json
     {
       "image_url": "string",
       "measure_value": "integer",
       "measure_uuid": "string"
     }
     ```

   - Em caso de erros de validação de dados ou duplicidade de leitura, retornar os códigos de erro apropriados:
     - **400**: Dados fornecidos no corpo da requisição são inválidos (retornar `INVALID_DATA`).
     - **409**: Já existe uma leitura para o tipo de medição no mês atual (retornar `DOUBLE_REPORT`).

### **Exemplo de Implementação**
#### Request:
```http
POST /upload
Content-Type: application/json
{
  "image": "base64data",
  "customer_code": "12345",
  "measure_datetime": "2024-08-27T10:00:00Z",
  "measure_type": "WATER"
}
```

#### Response (Sucesso):
```json
{
  "image_url": "http://link-to-temporary-image.com",
  "measure_value": 150,
  "measure_uuid": "uuid-1234-5678"
}
```

#### Response (Erro - Dados Inválidos):
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "O campo image está inválido"
}
```

#### Response (Erro - Leitura Duplicada):
```json
{
  "error_code": "DOUBLE_REPORT",
  "error_description": "Leitura do mês já realizada"
}
```

### **Checklist da Rota POST /upload**:
- [x] Receber a imagem e dados relacionados (customer_code, measure_datetime, measure_type).
- [x] Validar os dados de entrada.
- [x] Verificar se já existe uma leitura para o mês e tipo de leitura.
- [x] Integrar com a API do Google Gemini para extrair o valor numérico.
- [x] Retornar a imagem temporária, o valor extraído e o UUID.
- [x] Tratar e retornar erros adequados (400, 409).

Esses passos cobrem todas as responsabilidades da rota `POST /upload`.

---

Na rota **PATCH /confirm**, o objetivo é confirmar ou corrigir uma medição que foi enviada anteriormente. Essa rota serve para validar as informações processadas automaticamente ou para corrigi-las, caso haja alguma discrepância.

### **Requisitos da Rota PATCH /confirm**
1. **Receber os Dados de Confirmação ou Correção**:
   - A rota deve aceitar o identificador único da medição (`measure_uuid`) e o valor numérico da medição (`measure_value`) que precisa ser confirmado ou corrigido.

   **Request Body**:
   ```json
   {
     "measure_uuid": "string",
     "measure_value": "integer"
   }
   ```

2. **Validar os Dados**:
   - Verificar se o `measure_uuid` fornecido é válido e existe no sistema.
   - Validar se o valor da medição (`measure_value`) é um número inteiro e dentro dos parâmetros esperados.

3. **Atualizar o Registro da Medição**:
   - Se o `measure_uuid` for encontrado, a medição deve ser atualizada com o novo valor fornecido no campo `measure_value`.
   - A medição deve ser marcada como confirmada.

4. **Resposta da Rota**:
   - Se a operação for bem-sucedida, retornar um status code 200 com uma mensagem de confirmação da atualização.
   - Caso o `measure_uuid` não seja encontrado, retornar um erro 404 (`MEASURE_NOT_FOUND`).
   - Se os dados forem inválidos, retornar um erro 400 (`INVALID_DATA`).

### **Exemplo de Implementação**
#### Request:
```http
PATCH /confirm
Content-Type: application/json
{
  "measure_uuid": "uuid-1234-5678",
  "measure_value": 200
}
```

#### Response (Sucesso):
```json
{
  "message": "Leitura confirmada com sucesso"
}
```

#### Response (Erro - Medição Não Encontrada):
```json
{
  "error_code": "MEASURE_NOT_FOUND",
  "error_description": "A medição não foi encontrada"
}
```

#### Response (Erro - Dados Inválidos):
```json
{
  "error_code": "INVALID_DATA",
  "error_description": "O campo measure_value é inválido"
}
```

### **Checklist da Rota PATCH /confirm**:
- [ ] Receber o `measure_uuid` e o novo `measure_value` no corpo da requisição.
- [ ] Validar se o `measure_uuid` existe no sistema.
- [ ] Validar se o `measure_value` é válido (inteiro, dentro dos limites esperados).
- [ ] Atualizar o valor da medição e marcar a leitura como confirmada.
- [ ] Retornar uma resposta de sucesso ou os erros apropriados (404, 400).

### **Fluxo Geral da Rota PATCH /confirm**:
1. **Receber os dados**: `measure_uuid` e `measure_value`.
2. **Verificar a existência da medição**: Consultar o banco de dados para verificar se o `measure_uuid` existe.
3. **Atualizar a medição**: Se a medição for encontrada, atualize o valor e marque como confirmada.
4. **Resposta**: Retornar uma mensagem de sucesso ou erros apropriados.

Essa rota é essencial para garantir que as leituras automáticas sejam verificadas e ajustadas, proporcionando maior precisão e controle sobre as medições.

---

A rota **GET /<customer_code>/list** tem o objetivo de listar todas as leituras realizadas por um cliente específico, filtradas pelo seu `customer_code`. Essa rota retorna um histórico de medições, permitindo que o cliente veja todas as leituras realizadas e seus detalhes.

### **Requisitos da Rota GET /<customer_code>/list**
1. **Receber o `customer_code` como Parâmetro na URL**:
   - O `customer_code` será recebido diretamente na URL e será usado para filtrar as leituras de um cliente específico.

   **Exemplo de URL**:
   ```http
   GET /12345/list
   ```

2. **Filtrar as Leituras pelo `customer_code`**:
   - A rota deve buscar no banco de dados todas as leituras associadas ao `customer_code` fornecido.
   - As leituras podem incluir dados como `measure_datetime`, `measure_value`, `measure_type`, `measure_uuid`, e o status de confirmação (se foi confirmada ou não).

3. **Resposta da Rota**:
   - A rota deve retornar um array de objetos contendo os dados das leituras associadas ao cliente.
   - Se o cliente não tiver leituras, retornar um array vazio.
   - Se o `customer_code` não for encontrado, retornar um erro 404 (`CUSTOMER_NOT_FOUND`).

4. **Validação de Erros**:
   - Verificar se o `customer_code` é válido e existe no sistema.
   - Se o `customer_code` não existir ou não houver leituras associadas, retornar a mensagem de erro apropriada.

### **Exemplo de Implementação**
#### Request:
```http
GET /12345/list
```

#### Response (Sucesso):
```json
[
  {
    "measure_uuid": "uuid-1234-5678",
    "measure_datetime": "2024-08-27T10:00:00Z",
    "measure_value": 150,
    "measure_type": "WATER",
    "confirmed": true
  },
  {
    "measure_uuid": "uuid-5678-1234",
    "measure_datetime": "2024-07-27T10:00:00Z",
    "measure_value": 200,
    "measure_type": "GAS",
    "confirmed": false
  }
]
```

#### Response (Erro - Cliente Não Encontrado):
```json
{
  "error_code": "CUSTOMER_NOT_FOUND",
  "error_description": "O código do cliente não foi encontrado"
}
```

#### Response (Sem Leituras):
```json
[]
```

### **Checklist da Rota GET /<customer_code>/list**:
- [ ] Receber o `customer_code` como parâmetro da URL.
- [ ] Consultar o banco de dados para buscar todas as leituras associadas ao `customer_code`.
- [ ] Retornar as leituras em formato de array com detalhes como `measure_datetime`, `measure_value`, `measure_type`, `measure_uuid` e status de confirmação.
- [ ] Tratar os casos de erros (404 para `CUSTOMER_NOT_FOUND`).
- [ ] Retornar um array vazio se não houver leituras.

### **Fluxo Geral da Rota GET /<customer_code>/list**:
1. **Receber o `customer_code`**: Extraído da URL.
2. **Buscar no banco de dados**: Procurar todas as medições associadas ao cliente.
3. **Verificar resultados**: Retornar a lista de leituras ou uma resposta apropriada em caso de erro.
4. **Responder ao cliente**: Com um array contendo o histórico das leituras ou um erro caso o `customer_code` não seja encontrado.

Essa rota permite ao cliente acessar o histórico de medições, fornecendo transparência e controle sobre o consumo de água ou gás ao longo do tempo.