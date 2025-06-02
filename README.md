# 🧬 Xenobiology

## 🌌 Visão Geral

Xenobiology é um simulador de laboratório genético que permite a exploração da genética de bactérias alienígenas. Os usuários investigam a interação entre os genes R, K e W, descobrem hierarquias de dominância e criam colônias resistentes a bacteriófagos mutantes.

## 🧾 Estrutura do Projeto

```
📁 xenobiology/
├── index.html          Página principal
├── css/
│   └── styles.css      Estilos visuais
└── js/
    └── script.js       Lógica e mecânicas do jogo
```

## ⚙️ Funcionalidades Implementadas

### 🔬 Interface do Laboratório

1. **Painel de Controle Principal**
   - Criar Bactéria: Abre o Editor Genético para criar bactérias com genes específicos
   - Modo Infecção: Testa a resistência da colônia contra bacteriófagos
   - Banco de Dados: Consulta descobertas e estatísticas da colônia
   - Perfil do Cientista: Mostra conquistas e publicações científicas

2. **Câmara de Cultivo**
   - Visualização em tempo real das bactérias da colônia
   - Feedback visual para diferentes tipos genéticos (cores e brilhos)
   - Interação direta com bactérias individuais para análise

3. **Terminal de Experimentação**
   - Sistema de log para registrar eventos, descobertas e comandos
   - Interface de linha de comando para executar ações
   - Comandos avançados para criar, analisar e cruzar bactérias

4. **Ferramentas de Análise**
   - Examinar Bactéria: Análise detalhada de bactérias individuais
   - Sequenciar Genoma: Identificação precisa dos genes
   - Análise Populacional: Estatísticas e gráficos da colônia
   - Isolar Amostra: Seleção aleatória para estudo

### 🎮 Mecânicas de Jogo

1. **Sistema Genético**
   - Três genes (R, K, W) com diferentes propriedades
   - Hierarquia de dominância: R > K > W
   - Resistência baseada na quantidade de genes W:
     - WWW: 95% de resistência
     - XWW (X=R/K): 55% de resistência
     - XXW (X=R/K): 30% de resistência
     - XXX (X=R/K): 7% de resistência

2. **Reprodução e Cruzamento**
   - Sistema de cruzamento com doação genética configurável (1 ou 2 genes)
   - Mutações aleatórias durante reprodução
   - Descoberta automática de relações de dominância

3. **Modo Infecção**
   - Ondas progressivamente mais difíceis de bacteriófagos
   - Feedback visual para bactérias sobreviventes e mortas
   - Análise detalhada dos resultados por categoria genética

4. **Eventos Aleatórios**
   - Vazamento de Mutagênico: Aleatoriza genes em parte da colônia
   - Surto de Hipermutação: Aumenta taxa de mutação
   - Falha no Sistema de Quarentena: Vírus escapam, testando resistência

5. **Sistema de Progressão**
   - Pontos de Pesquisa acumulados por descobertas e conquistas
   - Eficiência de Sobrevivência calculada após cada onda
   - Publicações científicas geradas automaticamente

6. **Conquistas**
   - Primeira Bactéria: Criar a primeira bactéria
   - Dominância R>K e K>W: Descobrir relações de dominância
   - Resistência WWW: Observar a resistência máxima
   - Colônia Diversa: Manter alta diversidade genética
   - Resistência Improvável: Bactéria com 1 gene W sobrevivendo onda forte
   - Engenheiro Genético: Criar linhagem 100% resistente (WWW)
   - Caos Controlado: Sobreviver a evento aleatório
   - Publicação Revolucionária: Completar todas as descobertas

## 💻 Comandos do Terminal

- `ajuda` - Mostra lista de comandos disponíveis
- `iniciar` - Começa um novo experimento
- `criar [RRR|KKK|WWW|RKW|etc]` - Cria bactéria com genes específicos
- `criar` - Cria bactéria com genes aleatórios
- `analisar [id]` - Analisa bactéria específica
- `cruzar [id1] [id2] [genes1?] [genes2?]` - Cruza duas bactérias
- `infectar` - Inicia teste de infecção
- `status` - Mostra status atual da colônia
- `descobertas` - Lista descobertas genéticas
- `conquistas` - Lista conquistas desbloqueadas
- `limpar` - Limpa o log do terminal

## Instruções para Publicação no GitHub Pages

1. Descompacte o arquivo `xenobiology_completo.zip`
2. Faça upload de todos os arquivos e pastas para seu repositório GitHub
3. Ative o GitHub Pages nas configurações do repositório
4. O site estará disponível em `https://babisobrinho.github.io/xenobiology`

## ✅    Recursos Adicionais

- Interface responsiva para dispositivos móveis e desktop
- Animações e efeitos visuais para feedback imediato
- Sistema de log detalhado exportável
- Gráficos e visualizações para análise de dados
- Tutorial interativo para novos usuários

## 👩‍💻 Equipa de Desenvolvimento

- [Babi Sobrinho](https://github.com/babisobrinho)
- [Juliana Abreu](https://github.com/JulyDuds)
- [Lenice Soares](https://github.com/lenicesoaares)
- [Rebeca Santos](https://github.com/RebecaSantosb)
- [Thalyson Santos](https://github.com/taysoic)

## 📜 Licença

Este projeto é de caráter educativo e pode ser utilizado para fins não-comerciais.
Sinta-se livre para explorar, aprender e adaptar!
