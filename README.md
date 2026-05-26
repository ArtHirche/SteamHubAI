# 🎮 SteamHub IA

**SteamHub IA** é um gerenciador inteligente e painel estatístico para sua biblioteca de jogos da Steam, equipado com um recomendador neural baseado em Inteligência Artificial que ajuda você a escolher o próximo jogo do seu backlog de forma personalizada.

A interface foi projetada com foco em excelência visual e estética moderna, inspirada diretamente na interface escura e futurista do cliente Steam oficial, utilizando efeitos de Glassmorphism (vidro fosco), gradientes vibrantes em tons de azul profundo e ciano, além de animações fluidas simulando um núcleo de rede neural em processamento.

---

## ✨ Funcionalidades Principais

*   **🔌 Sincronização Oficial com Steam Web API:** Importe sua biblioteca real de jogos e suas horas jogadas reais de forma segura. O app armazena sua chave de API e SteamID exclusivamente no seu navegador (`localStorage`).
*   **🤖 Recomendador de Jogos IA:** Analisa seu histórico de jogabilidade e o tempo jogado para traçar afinidades de gêneros mais aproveitados.
*   **⚠️ Algoritmo de Penalidade para Desistências:** Se você categorizar um jogo como **Abandonado**, a IA aprende seus padrões de desistência e penaliza esses gêneros específicos na hora de calcular qual jogo do backlog sugerir.
*   **📊 Gerenciamento Completo de Status:** Acompanhe seu progresso dividindo seus títulos em 5 categorias:
    *   *Não Iniciado (Backlog)*
    *   *Quero Jogar*
    *   *Jogando*
    *   *Já Joguei* (com badge especial de Concluído)
    *   *Abandonados*
*   **🔍 Busca e Filtros Dinâmicos:** Filtre seus jogos por texto de pesquisa, caixa de seleção de status ou tags de gêneros detectadas dinamicamente na sua coleção.
*   **🚀 Modo de Demonstração:** Carregue uma biblioteca simulada de alta qualidade com um único clique caso queira testar o aplicativo antes de conectar sua conta.

---

## 🛠️ Tecnologias Utilizadas

1.  **Core & Estrutura:** HTML5 Semântico e Vanilla Javascript (ESM).
2.  **Estilização (CSS3):** Vanilla CSS moderno utilizando CSS Variables para tokens de design, transições fluidas e responsividade completa.
3.  **Ambiente de Build:** [Vite](https://vitejs.dev/) para empacotamento rápido e gerenciamento do servidor local.
4.  **Reverse Proxy:** Integração de proxy customizada no Vite para contornar problemas de CORS ao se comunicar com os serviços da Steam.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado em sua máquina (versão 18 ou superior recomendada).

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/ArtHirche/SteamHubAI.git
    cd SteamHubAI
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse no seu navegador:**
    Abra o link exibido no terminal, tipicamente **`http://localhost:5173/`**.

---

## 🔒 Segurança e Privacidade das Chaves

A segurança dos seus dados é prioritária. O aplicativo funciona inteiramente do lado do cliente (Client-Side Only):
*   Tanto a sua **Steam Web API Key** quanto o seu **SteamID** são salvos de forma privada no `localStorage` do seu navegador.
*   Nenhuma informação sensível é enviada ou armazenada em servidores de terceiros.
*   A comunicação com a API da Steam é feita através de um proxy reverso configurado no Vite local.

---

## 🤝 Contribuições

Contribuições, issues e sugestões de melhorias são muito bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

---

Desenvolvido com carinho para ajudar você a domar seu backlog da Steam! 🎮🤖
