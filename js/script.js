// Xenobiology - Script Principal (Versão Completa)

// Variáveis globais
let colonia = [];
let descobertas = {
    dominancia: {
        "R>K": false,
        "K>W": false,
        "R>W": false
    },
    resistencia: {
        "WWW": false,
        "RWW/KWW": false,
        "RRW/KKW/RKW": false,
        "RRR/RRK/KKK/KKR": false
    },
    valores: {
        "WWW": 95,
        "RWW/KWW": 55,
        "RRW/KKW/RKW": 30,
        "RRR/RRK/KKK/KKR": 7
    },
    conhecimentoResistencia: {
        "WWW": false,
        "RWW/KWW": false,
        "RRW/KKW/RKW": false,
        "RRR/RRK/KKK/KKR": false
    }
};
let conquistas = {
    "primeira_bacteria": false,
    "dominancia_rk": false,
    "dominancia_kw": false,
    "resistencia_www": false,
    "colonia_diversa": false,
    "resistencia_improvavel": false,
    "engenheiro_genetico": false,
    "caos_controlado": false,
    "publicacao_revolucionaria": false
};
let publicacoes = {
    "resistencia": false,
    "dominancia": false
};
let bacteriaCounter = 0;
let slotSelecionado = null;
let genesAtuais = ["?", "?", "?"];
let nivelOnda = 1;
let pontosPesquisa = 0;
let eficienciaSobrevivencia = 0;
let jogoIniciado = false;
let ultimoEvento = 0; // Timestamp do último evento aleatório
const INTERVALO_EVENTO = 60000; // 1 minuto entre eventos aleatórios

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar tooltips e popovers do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Event listeners
    document.getElementById("start-btn").addEventListener("click", iniciarExperimento);
    document.getElementById("criar-bacteria-btn").addEventListener("click", abrirEditorGenetico);
    document.getElementById("criar-massa-btn").addEventListener("click", abrirCriacaoMassa);
    document.getElementById("modo-infeccao-btn").addEventListener("click", iniciarModoInfeccao);
    document.getElementById("banco-dados-btn").addEventListener("click", abrirBancoDados);
    document.getElementById("perfil-btn").addEventListener("click", abrirPerfilCientista);
    document.getElementById("clear-log-btn").addEventListener("click", limparTerminal);
    document.getElementById("export-log-btn").addEventListener("click", exportarLog);
    document.getElementById("terminal-input").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            processarComandoTerminal();
        }
    });
    document.getElementById("criar-bacteria-confirm").addEventListener("click", criarBacteria);

    // Alternar entre tipos de criação
    document.querySelectorAll('input[name="tipo-criacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById("genes-especificos-container").style.display = 
                this.value === "especifico" ? "block" : "none";
        });
    });

    // Confirmar criação em massa
    document.getElementById("confirmar-criacao-massa").addEventListener("click", criarBacteriasEmMassa);

    // Configurar editor genético
    configurarEditorGenetico();

    // Adicionar log inicial
    adicionarLog("SISTEMA", "Bem-vindo ao Laboratório de Xenobiology. Você é um cientista recém-chegado, encarregado de estudar uma colônia de bactérias alienígenas.");
    adicionarLog("SISTEMA", "Seu objetivo é descobrir como os genes R, K e W interagem, entender suas hierarquias de dominância e criar uma colônia resistente a bacteriófagos mutantes.");
    adicionarLog("SISTEMA", "Digite \'ajuda\' no terminal para ver os comandos disponíveis.");

    // Iniciar loop de eventos aleatórios
    setInterval(verificarEventoAleatorio, 10000); // Verifica a cada 10 segundos
});

// --- Estrutura do modal ---

function criarModal(title, content, footer, size = '') {
    // Cria a estrutura básica do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = '-1';
    modalDiv.innerHTML = `
        <div class="modal-dialog ${size}">
            <div class="modal-content bg-dark text-light border border-secondary">
                <div class="modal-header border-bottom border-secondary">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer border-top border-secondary">${footer}</div>` : ''}
            </div>
        </div>
    `;
    
    // Adiciona ao body antes de mostrar
    document.body.appendChild(modalDiv);
    
    // Cria a instância do modal Bootstrap
    const modal = new bootstrap.Modal(modalDiv);
    
    // Configura eventos para limpeza quando o modal for fechado
    modalDiv.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalDiv);
    });
    
    // Mostra o modal
    modal.show();
    
    return modal;
}

// --- Funções Principais do Jogo ---

function iniciarExperimento() {
    adicionarLog("SISTEMA", "Iniciando novo experimento...");
    jogoIniciado = true;
    
    // Resetar estado do jogo
    colonia = [];
    bacteriaCounter = 0;
    nivelOnda = 1;
    pontosPesquisa = 0;
    eficienciaSobrevivencia = 0;
    ultimoEvento = Date.now();
    
    // Resetar descobertas e conquistas
    descobertas.dominancia = { "R>K": false, "K>W": false, "R>W": false };
    descobertas.conhecimentoResistencia = { "WWW": false, "RWW/KWW": false, "RRW/KKW/RKW": false, "RRR/RRK/KKK/KKR": false };
    conquistas = { "primeira_bacteria": false, "dominancia_rk": false, "dominancia_kw": false, "resistencia_www": false, "colonia_diversa": false, "resistencia_improvavel": false, "engenheiro_genetico": false, "caos_controlado": false, "publicacao_revolucionaria": false };
    publicacoes = { "resistencia": false, "dominancia": false };

    // Atualizar interface
    atualizarStatusColonia();
    atualizarProgressoDescoberta();
    
    // Habilitar botões de ferramentas de análise
    document.querySelectorAll(".tool-buttons button").forEach(btn => {
        btn.disabled = false;
        // Adicionar listeners aos botões de ferramentas
        if (btn.id === "examinar-bacteria-btn") btn.addEventListener("click", () => adicionarLog("SISTEMA", "Clique em uma bactéria na câmara para examiná-la."));
        if (btn.id === "sequenciar-genoma-btn") btn.addEventListener("click", () => adicionarLog("SISTEMA", "Clique em uma bactéria e use o botão \'Sequenciar Genoma\' na janela de análise."));
        if (btn.id === "analise-populacional-btn") btn.addEventListener("click", abrirAnalisePopulacional);
        if (btn.id === "isolar-amostra-btn") btn.addEventListener("click", isolarAmostraAleatoria);
    });
    
    // Limpar câmara de cultivo
    const chamberViewport = document.getElementById("chamber-viewport");
    chamberViewport.innerHTML = 
        `<div class="empty-chamber text-center py-5">
            <i class="fas fa-vial fa-4x text-muted mb-3"></i>
            <p class="text-muted">Câmara de cultivo vazia. Crie uma bactéria para iniciar.</p>
        </div>`;
    chamberViewport.classList.add("active");
    
    // Adicionar mensagem de início
    adicionarLog("SISTEMA", "Experimento iniciado. Crie sua primeira bactéria usando o Editor Genético ou o comando \'criar\'.");
    adicionarLog("DICA", "Use o comando \'criar RKW\' para criar uma bactéria com genes específicos, ou \'criar\' para genes aleatórios.");
}

// --- Editor Genético ---

function abrirEditorGenetico() {
    if (!jogoIniciado) {
        adicionarLog("SISTEMA", "Inicie um experimento primeiro.");
        return;
    }
    genesAtuais = ["?", "?", "?"];
    atualizarSlotsGeneticos();
    atualizarPreviewBacteria();
    atualizarInfoGenetica();
    const editorModal = new bootstrap.Modal(document.getElementById("editorGeneticoModal"));
    editorModal.show();
}

function configurarEditorGenetico() {
    document.querySelectorAll(".gene-slot").forEach(slot => {
        slot.addEventListener("click", function() {
            slotSelecionado = parseInt(this.dataset.slot);
            document.querySelectorAll(".gene-slot").forEach(s => s.classList.remove("selected"));
            this.classList.add("selected");
        });
    });
    document.querySelectorAll(".gene-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            if (slotSelecionado !== null) {
                const gene = this.dataset.gene;
                genesAtuais[slotSelecionado - 1] = gene;
                atualizarSlotsGeneticos();
                atualizarPreviewBacteria();
                atualizarInfoGenetica();
                slotSelecionado = null;
                document.querySelectorAll(".gene-slot").forEach(s => s.classList.remove("selected"));
            } else {
                adicionarLog("SISTEMA", "Selecione um slot genético primeiro.");
            }
        });
    });
}

function atualizarSlotsGeneticos() {
    document.querySelectorAll(".gene-slot").forEach((slot, index) => {
        const gene = genesAtuais[index];
        slot.textContent = gene;
        slot.setAttribute("data-gene", gene);
        slot.className = "gene-slot"; // Reset classes
        if (gene === "R" || gene === "K" || gene === "W") {
            slot.classList.add(`gene-${gene}`);
        }
        if (slotSelecionado === index + 1) {
             slot.classList.add("selected");
        }
    });
}

function atualizarPreviewBacteria() {
    const previewContainer = document.querySelector(".preview-container");
    previewContainer.innerHTML = "";
    const bacteriaEl = document.createElement("div");
    bacteriaEl.classList.add("bacteria-preview-item");
    let genesProntos = genesAtuais.filter(g => g !== "?").length;
    let classeGene = "bacteria-unknown";
    let tamanho = 60;

    if (genesProntos === 3) {
        const contagem = { "R": 0, "K": 0, "W": 0 };
        genesAtuais.forEach(g => contagem[g]++);
        let genePredominante = "R";
        if (contagem["K"] > contagem[genePredominante]) genePredominante = "K";
        if (contagem["W"] > contagem[genePredominante]) genePredominante = "W";
        classeGene = `bacteria-${genePredominante}`;
        tamanho = 80;
    } else if (genesProntos > 0) {
        const primeiroGene = genesAtuais.find(g => g !== "?");
        classeGene = `bacteria-${primeiroGene}`;
        tamanho = 60 + (genesProntos * 10);
    }

    bacteriaEl.classList.add("bacteria", classeGene);
    bacteriaEl.style.width = `${tamanho}px`;
    bacteriaEl.style.height = `${tamanho}px`;
    previewContainer.appendChild(bacteriaEl);
}

function atualizarInfoGenetica() {
    const resistenciaEl = document.getElementById("resistencia-estimada");
    const dominanciaEl = document.getElementById("dominancia");
    const raridadeEl = document.getElementById("raridade");
    const descricaoEl = document.querySelector(".gene-description");
    const contagem = { "R": 0, "K": 0, "W": 0, "?": 0 };
    genesAtuais.forEach(g => contagem[g]++);

    if (contagem["?"] === 3) {
        descricaoEl.textContent = "Selecione os genes para ver informações.";
        resistenciaEl.textContent = "Desconhecida";
        dominanciaEl.textContent = "Desconhecida";
        raridadeEl.textContent = "Desconhecida";
    } else {
        let descricao = "Bactéria com ";
        if (contagem["R"] > 0) descricao += `${contagem["R"]} gene(s) R, `;
        if (contagem["K"] > 0) descricao += `${contagem["K"]} gene(s) K, `;
        if (contagem["W"] > 0) descricao += `${contagem["W"]} gene(s) W, `;
        if (contagem["?"] > 0) descricao += `${contagem["?"]} gene(s) desconhecidos, `;
        descricao = descricao.slice(0, -2) + ".";
        descricaoEl.textContent = descricao;

        if (contagem["?"] === 0) {
            let resistencia = "Desconhecida";
            const genesStr = genesAtuais.join("");
            const contagemW = contagem["W"];
            let categoriaResistencia = "";

            if (contagemW === 3) categoriaResistencia = "WWW";
            else if (contagemW === 2) categoriaResistencia = "RWW/KWW";
            else if (contagemW === 1) categoriaResistencia = "RRW/KKW/RKW";
            else categoriaResistencia = "RRR/RRK/KKK/KKR";

            if (descobertas.conhecimentoResistencia[categoriaResistencia]) {
                resistencia = descobertas.valores[categoriaResistencia] + "%";
            } else {
                 if (contagemW === 3) resistencia = "Alta (estimada)";
                 else if (contagemW === 2) resistencia = "Média-Alta (estimada)";
                 else if (contagemW === 1) resistencia = "Média-Baixa (estimada)";
                 else resistencia = "Baixa (estimada)";
            }
            resistenciaEl.textContent = resistencia;

            let dominancia = "Desconhecida";
            if (descobertas.dominancia["R>K"] && descobertas.dominancia["K>W"]) {
                dominancia = "R > K > W";
            } else if (descobertas.dominancia["R>K"]) {
                dominancia = "R > K";
            } else if (descobertas.dominancia["K>W"]) {
                dominancia = "K > W";
            } else if (descobertas.dominancia["R>W"]) {
                dominancia = "R > W";
            }
            dominanciaEl.textContent = dominancia;

            let raridade = "Comum";
            if (contagemW === 3) raridade = "Muito Rara";
            else if (contagemW === 2) raridade = "Rara";
            else if (contagemW === 1) raridade = "Incomum";
            raridadeEl.textContent = raridade;
        } else {
            resistenciaEl.textContent = "Parcialmente Conhecida";
            dominanciaEl.textContent = "Parcialmente Conhecida";
            raridadeEl.textContent = "Indeterminada";
        }
    }
    atualizarProgressoDescoberta();
}

function atualizarProgressoDescoberta() {
    let progressoR = 0, progressoK = 0, progressoW = 0;
    if (descobertas.dominancia["R>K"]) { progressoR += 30; progressoK += 10; }
    if (descobertas.dominancia["K>W"]) { progressoK += 30; progressoW += 10; }
    if (descobertas.dominancia["R>W"]) { progressoR += 30; progressoW += 10; }

    if (descobertas.conhecimentoResistencia["RRR/RRK/KKK/KKR"]) { progressoR += 10; progressoK += 10; }
    if (descobertas.conhecimentoResistencia["RRW/KKW/RKW"]) { progressoR += 10; progressoK += 10; progressoW += 20; }
    if (descobertas.conhecimentoResistencia["RWW/KWW"]) { progressoR += 5; progressoK += 5; progressoW += 30; }
    if (descobertas.conhecimentoResistencia["WWW"]) { progressoW += 30; }

    progressoR = Math.min(progressoR, 100);
    progressoK = Math.min(progressoK, 100);
    progressoW = Math.min(progressoW, 100);

    document.getElementById("gene-r-progress").textContent = `${progressoR}%`;
    document.getElementById("gene-k-progress").textContent = `${progressoK}%`;
    document.getElementById("gene-w-progress").textContent = `${progressoW}%`;
    document.querySelector(".progress-bar.bg-danger").style.width = `${progressoR}%`;
    document.querySelector(".progress-bar.bg-primary").style.width = `${progressoK}%`;
    document.querySelector(".progress-bar.bg-success").style.width = `${progressoW}%`;
}

// --- Criação e Manipulação de Bactérias ---

function criarBacteria() {
    if (!jogoIniciado) {
        adicionarLog("SISTEMA", "Inicie um experimento primeiro.");
        return;
    }
    if (genesAtuais.includes("?")) {
        adicionarLog("SISTEMA", "Selecione todos os genes antes de criar a bactéria.");
        return;
    }
    const novaBacteria = {
        id: ++bacteriaCounter,
        genes: [...genesAtuais],
        idade: 0,
        saude: 100,
        resistencia: calcularResistenciaBacteria({ genes: genesAtuais }) // Calcula resistência no momento da criação
    };
    colonia.push(novaBacteria);
    atualizarStatusColonia();
    adicionarBacteriaNaCamara(novaBacteria);
    bootstrap.Modal.getInstance(document.getElementById("editorGeneticoModal")).hide();
    adicionarLog("LABORATÓRIO", `Bactéria #${novaBacteria.id} criada com genes ${novaBacteria.genes.join("")}. Resistência: ${novaBacteria.resistencia}%.`);
    
    // Conquista: Primeira Bactéria
    if (!conquistas["primeira_bacteria"]) {
        conquistas["primeira_bacteria"] = true;
        adicionarLog("CONQUISTA", "Primeira Bactéria: Você criou sua primeira bactéria alienígena!");
        pontosPesquisa += 10;
    }
    // Conquista: Engenheiro Genético (WWW)
    if (novaBacteria.genes.join("") === "WWW" && !conquistas["engenheiro_genetico"]) {
        conquistas["engenheiro_genetico"] = true;
        adicionarLog("CONQUISTA", "Engenheiro Genético: Você criou uma linhagem 100% resistente (WWW)!");
        pontosPesquisa += 100;
    }
}

function adicionarBacteriaNaCamara(bacteria) {
    const chamberViewport = document.getElementById("chamber-viewport");
    const emptyMessage = chamberViewport.querySelector(".empty-chamber");
    if (emptyMessage) {
        chamberViewport.removeChild(emptyMessage);
    }
    const bacteriaEl = document.createElement("div");
    bacteriaEl.classList.add("bacteria");
    bacteriaEl.setAttribute("data-id", bacteria.id);

    const contagem = { "R": 0, "K": 0, "W": 0 };
    bacteria.genes.forEach(g => contagem[g]++);
    let genePredominante = "R";
    if (contagem["K"] > contagem[genePredominante]) genePredominante = "K";
    if (contagem["W"] > contagem[genePredominante]) genePredominante = "W";
    bacteriaEl.classList.add(`bacteria-${genePredominante}`);

    // Adiciona brilho para gene W
    if (contagem["W"] > 0) {
        bacteriaEl.classList.add("glow-w");
        bacteriaEl.style.setProperty("--glow-intensity", contagem["W"] / 3);
    }

    const tamanho = 15 + (contagem["W"] * 5) + (contagem["K"] * 2); // W e K aumentam o tamanho
    bacteriaEl.style.width = `${tamanho}px`;
    bacteriaEl.style.height = `${tamanho}px`;

    const maxX = chamberViewport.offsetWidth - tamanho;
    const maxY = chamberViewport.offsetHeight - tamanho;
    const posX = Math.floor(Math.random() * maxX);
    const posY = Math.floor(Math.random() * maxY);
    bacteriaEl.style.left = `${posX}px`;
    bacteriaEl.style.top = `${posY}px`;

    bacteriaEl.setAttribute("title", `Bactéria #${bacteria.id}: ${bacteria.genes.join("")} (Res: ${bacteria.resistencia}%)`);
    bacteriaEl.setAttribute("data-bs-toggle", "tooltip");
    bacteriaEl.setAttribute("data-bs-placement", "top");
    bacteriaEl.addEventListener("click", function() {
        analisarBacteria(bacteria.id);
    });
    chamberViewport.appendChild(bacteriaEl);
    new bootstrap.Tooltip(bacteriaEl);
}

function atualizarStatusColonia() {
    document.getElementById("populacao-total").textContent = colonia.length;
    let resistenciaTotal = 0;
    colonia.forEach(bacteria => {
        resistenciaTotal += bacteria.resistencia;
    });
    const resistenciaMedia = colonia.length > 0 ? Math.round(resistenciaTotal / colonia.length) : 0;
    document.getElementById("resistencia-media").textContent = `${resistenciaMedia}%`;

    const combinacoesUnicas = new Set();
    colonia.forEach(bacteria => {
        combinacoesUnicas.add(bacteria.genes.sort().join("")); // Ordena para contar combinações únicas
    });
    let diversidade = "Baixa";
    const numCombinacoes = combinacoesUnicas.size;
    if (numCombinacoes >= 5) diversidade = "Muito Alta";
    else if (numCombinacoes >= 3) diversidade = "Alta";
    else if (numCombinacoes >= 2) diversidade = "Média";
    document.getElementById("diversidade-genetica").textContent = diversidade;

    // Conquista: Colônia Diversa
    if (diversidade === "Alta" && !conquistas["colonia_diversa"]) {
        conquistas["colonia_diversa"] = true;
        adicionarLog("CONQUISTA", "Diversidade Genética: Sua colônia possui alta diversidade genética!");
        pontosPesquisa += 50;
    }

    // Atualizar barras de progresso
    document.querySelector("#laboratorio .progress-bar.bg-success").style.width = `${Math.min(colonia.length, 100)}%`; // Limita a 100
    document.querySelector("#laboratorio .progress-bar.bg-warning").style.width = `${resistenciaMedia}%`;
    const porcentagemDiversidade = Math.min(numCombinacoes * 20, 100); // 5 combinações = 100%
    document.querySelector("#laboratorio .progress-bar.bg-info").style.width = `${porcentagemDiversidade}%`;

    // Atualizar alerta
    const alertDiv = document.querySelector("#laboratorio .alert");
    if (colonia.length > 0) {
        alertDiv.style.display = "none";
    } else {
        alertDiv.style.display = "block";
        alertDiv.innerHTML = `<small>${jogoIniciado ? "Colônia vazia. Crie novas bactérias." : "Nenhuma colônia ativa. Inicie um experimento."}</small>`;
    }
}

function abrirCriacaoMassa() {
    if (!jogoIniciado) {
        adicionarLog("SISTEMA", "Inicie um experimento primeiro.");
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById("criacaoMassaModal"));
    modal.show();
}

function criarBacteriasEmMassa() {
    const quantidade = parseInt(document.getElementById("quantidade-bacterias").value);
    const tipoCriacao = document.querySelector('input[name="tipo-criacao"]:checked').value;
    
    if (isNaN(quantidade)) {
        adicionarLog("ERRO", "Quantidade inválida.");
        return;
    }
    
    let genesAlvo = null;
    if (tipoCriacao === "especifico") {
        const genesInput = document.getElementById("genes-especificos").value.toUpperCase();
        if (!/^[RKW]{3}$/.test(genesInput)) {
            adicionarLog("ERRO", "Genes inválidos. Use apenas R, K ou W (ex: RKW, WWW)");
            return;
        }
        genesAlvo = genesInput.split("");
    }
    
    // Limitar a 100 bactérias por vez para evitar travamentos
    const qtdFinal = Math.min(100, Math.max(1, quantidade));
    
    // Criar bactérias
    for (let i = 0; i < qtdFinal; i++) {
        const genes = genesAlvo ? [...genesAlvo] : gerarGenesAleatorios();
        const novaBacteria = {
            id: ++bacteriaCounter,
            genes: genes,
            idade: 0,
            saude: 100,
            resistencia: calcularResistenciaBacteria({ genes: genes })
        };
        colonia.push(novaBacteria);
        adicionarBacteriaNaCamara(novaBacteria);
    }
    
    atualizarStatusColonia();
    bootstrap.Modal.getInstance(document.getElementById("criacaoMassaModal")).hide();
    adicionarLog("LABORATÓRIO", `${qtdFinal} bactérias criadas em massa. População atual: ${colonia.length}`);
    
    // Verificar conquistas
    if (!conquistas["primeira_bacteria"]) {
        conquistas["primeira_bacteria"] = true;
        adicionarLog("CONQUISTA", "Primeira Bactéria: Você criou sua primeira bactéria alienígena!");
        pontosPesquisa += 10;
    }
    
    // Verificar se criou alguma WWW
    if (colonia.some(b => b.genes.join("") === "WWW") && !conquistas["engenheiro_genetico"]) {
        conquistas["engenheiro_genetico"] = true;
        adicionarLog("CONQUISTA", "Engenheiro Genético: Você criou uma linhagem 100% resistente (WWW)!");
        pontosPesquisa += 100;
    }
}

function gerarGenesAleatorios() {
    const opcoesGenes = ["R", "K", "W"];
    const genes = [];
    for (let i = 0; i < 3; i++) {
        genes.push(opcoesGenes[Math.floor(Math.random() * 3)]);
    }
    return genes;
}

function criarBacteriasEmMassaPorComando(partes) {
    if (partes.length < 2 || isNaN(parseInt(partes[1]))) {
        adicionarLog("ERRO", "Quantidade não especificada. Ex: criar-massa 10");
        return;
    }
    
    const quantidade = parseInt(partes[1]);
    let genesAlvo = null;
    
    if (partes.length > 2 && /^[RKW]{3}$/i.test(partes[2])) {
        genesAlvo = partes[2].toUpperCase().split("");
    }
    
    // Limitar a 100 bactérias por vez para evitar travamentos
    const qtdFinal = Math.min(100, Math.max(1, quantidade));
    
    // Criar bactérias
    for (let i = 0; i < qtdFinal; i++) {
        const genes = genesAlvo ? [...genesAlvo] : gerarGenesAleatorios();
        const novaBacteria = {
            id: ++bacteriaCounter,
            genes: genes,
            idade: 0,
            saude: 100,
            resistencia: calcularResistenciaBacteria({ genes: genes })
        };
        colonia.push(novaBacteria);
        adicionarBacteriaNaCamara(novaBacteria);
    }
    
    atualizarStatusColonia();
    adicionarLog("LABORATÓRIO", `${qtdFinal} bactérias criadas via terminal. População atual: ${colonia.length}`);
    
    // Verificar conquistas
    if (!conquistas["primeira_bacteria"]) {
        conquistas["primeira_bacteria"] = true;
        adicionarLog("CONQUISTA", "Primeira Bactéria: Você criou sua primeira bactéria alienígena!");
        pontosPesquisa += 10;
    }
    
    // Verificar se criou alguma WWW
    if (colonia.some(b => b.genes.join("") === "WWW") && !conquistas["engenheiro_genetico"]) {
        conquistas["engenheiro_genetico"] = true;
        adicionarLog("CONQUISTA", "Engenheiro Genético: Você criou uma linhagem 100% resistente (WWW)!");
        pontosPesquisa += 100;
    }
}

// --- Modo Infecção ---

function iniciarModoInfeccao() {
    if (!jogoIniciado || colonia.length === 0) {
        // Mensagens de erro já existentes
        return;
    }

    adicionarLog("LABORATÓRIO", `Iniciando teste de infecção (Onda ${nivelOnda})...`);

    // Cria o elemento do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = '-1';
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border border-danger">
                <div class="modal-header border-bottom border-danger">
                    <h5 class="modal-title">
                        <i class="fas fa-virus text-danger me-2"></i>Modo Infecção - Onda ${nivelOnda}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <p>Expondo colônia a bacteriófagos...</p>
                    <div class="progress mb-4">
                        <div id="infecaoProgress" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 0%"></div>
                    </div>
                    <div class="infection-animation">
                        <i class="fas fa-virus fa-3x text-danger mb-3 pulse-animation"></i>
                    </div>
                    <p class="mt-3">Aguarde enquanto o teste é realizado.</p>
                </div>
            </div>
        </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(modalDiv);

    // Inicializa o modal
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();

    // Configura a animação de progresso
    const progressBar = modalDiv.querySelector("#infecaoProgress");
    let progresso = 0;
    
    const intervalo = setInterval(() => {
        progresso += 10;
        progressBar.style.width = `${progresso}%`;
        
        if (progresso >= 100) {
            clearInterval(intervalo);
            processarResultadosInfeccao();
            
            // Fecha o modal após 1.5 segundos
            setTimeout(() => modal.hide(), 1500);
        }
    }, 300);

    // Limpeza quando o modal for fechado
    modalDiv.addEventListener('hidden.bs.modal', () => {
        clearInterval(intervalo);
        if (modalDiv.parentNode) {
            modalDiv.parentNode.removeChild(modalDiv);
        }
    });
}

function processarResultadosInfeccao() {
    const coloniaAntes = [...colonia];
    const resultados = {
        total: coloniaAntes.length,
        sobreviventes: 0,
        mortos: 0,
        porGene: {
            "WWW": { total: 0, sobreviventes: 0 },
            "RWW/KWW": { total: 0, sobreviventes: 0 },
            "RRW/KKW/RKW": { total: 0, sobreviventes: 0 },
            "RRR/RRK/KKK/KKR": { total: 0, sobreviventes: 0 }
        }
    };
    let sobreviventeResistenciaImprovavel = false;

    // Dificuldade da onda (afeta a chance de sobrevivência)
    const fatorDificuldade = 1 + (nivelOnda - 1) * 0.1; // Aumenta a "força" do vírus

    coloniaAntes.forEach(bacteria => {
        const contagemW = bacteria.genes.filter(g => g === "W").length;
        let resistenciaBase = bacteria.resistencia;
        let categoria = "";

        if (contagemW === 3) categoria = "WWW";
        else if (contagemW === 2) categoria = "RWW/KWW";
        else if (contagemW === 1) categoria = "RRW/KKW/RKW";
        else categoria = "RRR/RRK/KKK/KKR";

        // Registrar conhecimento da resistência
        if (!descobertas.conhecimentoResistencia[categoria]) {
            descobertas.conhecimentoResistencia[categoria] = true;
            adicionarLog("DESCOBERTA", `Resistência de bactérias ${categoria} observada: ${resistenciaBase}%.`);
            pontosPesquisa += 20;
            verificarPublicacaoResistencia();
        }
        
        resultados.porGene[categoria].total++;
        
        // Ajusta a chance de sobrevivência com base na dificuldade
        const chanceSobreviver = Math.max(0, resistenciaBase / fatorDificuldade);
        const sobreviveu = Math.random() * 100 < chanceSobreviver;
        
        const bacteriaEl = document.querySelector(`.bacteria[data-id="${bacteria.id}"]`);

        if (sobreviveu) {
            resultados.sobreviventes++;
            resultados.porGene[categoria].sobreviventes++;
            if (contagemW === 1 && nivelOnda >= 3) { // Resistência improvável: 1 gene W sobrevive onda forte
                sobreviventeResistenciaImprovavel = true;
            }
            // Feedback visual de sobrevivência (opcional)
            if (bacteriaEl) {
                bacteriaEl.classList.add("survived-infection");
                setTimeout(() => bacteriaEl.classList.remove("survived-infection"), 1000);
            }
        } else {
            resultados.mortos++;
            colonia = colonia.filter(b => b.id !== bacteria.id);
            if (bacteriaEl) {
                bacteriaEl.classList.add("dying");
                setTimeout(() => {
                    if (bacteriaEl.parentNode) bacteriaEl.parentNode.removeChild(bacteriaEl);
                }, 1000);
            }
        }
    });
    
    atualizarStatusColonia();
    
    const taxaSobrevivenciaGeral = resultados.total > 0 ? Math.round(resultados.sobreviventes / resultados.total * 100) : 0;
    adicionarLog("LABORATÓRIO", `Onda ${nivelOnda} concluída. Sobreviventes: ${resultados.sobreviventes}/${resultados.total} (${taxaSobrevivenciaGeral}%).`);
    eficienciaSobrevivencia += taxaSobrevivenciaGeral; // Acumula para pontuação

    // Detalhes por categoria
    for (const [categoria, dados] of Object.entries(resultados.porGene)) {
        if (dados.total > 0) {
            const taxa = Math.round(dados.sobreviventes / dados.total * 100);
            adicionarLog("DADOS", `Bactérias ${categoria}: ${dados.sobreviventes}/${dados.total} sobreviveram (${taxa}%).`);
        }
    }
    
    gerarHipotese(resultados);
    verificarConquistasPosInfeccao(sobreviventeResistenciaImprovavel);

    if (colonia.length === 0) {
        adicionarLog("ALERTA", "Toda a colônia foi exterminada! Crie novas bactérias para continuar.");
        const chamberViewport = document.getElementById("chamber-viewport");
        chamberViewport.innerHTML = `
            <div class="empty-chamber text-center py-5">
                <i class="fas fa-skull-crossbones fa-4x text-danger mb-3"></i>
                <p class="text-danger">Colônia exterminada. Crie novas bactérias para continuar.</p>
            </div>
        `;
    } else {
        nivelOnda++; // Avança para a próxima onda
        adicionarLog("SISTEMA", `Preparando para a Onda ${nivelOnda}. A dificuldade aumentará.`);
    }
}

function verificarConquistasPosInfeccao(sobreviventeResistenciaImprovavel) {
    // Conquista: Resistência Improvável
    if (sobreviventeResistenciaImprovavel && !conquistas["resistencia_improvavel"]) {
        conquistas["resistencia_improvavel"] = true;
        adicionarLog("CONQUISTA", "Resistência Improvável: Uma bactéria com apenas 1 gene W sobreviveu a uma onda forte!");
        pontosPesquisa += 75;
    }
}

// --- Geração de Hipóteses e Publicações ---

function gerarHipotese(resultados) {
    let hipotesesGeradas = false;
    const hipotesesContainer = document.getElementById("hipoteses");
    // Limpa hipóteses antigas se houver novas
    let novasHipoteses = [];

    // Hipótese sobre resistência do gene W
    if (resultados.porGene["WWW"].total > 0 && resultados.porGene["RRR/RRK/KKK/KKR"].total > 0) {
        const taxaWWW = resultados.porGene["WWW"].sobreviventes / resultados.porGene["WWW"].total;
        const taxaSemW = resultados.porGene["RRR/RRK/KKK/KKR"].sobreviventes / resultados.porGene["RRR/RRK/KKK/KKR"].total;
        if (taxaWWW > taxaSemW + 0.1) { // Adiciona margem para evitar hipóteses por flutuações pequenas
            const hipoteseHTML = `
                <h6>Hipótese: Resistência do Gene W</h6>
                <p>Bactérias com três genes W (WWW) apresentam resistência significativamente maior comparadas a bactérias sem genes W.</p>
                <div class="small text-muted">Baseado em ${resultados.porGene["WWW"].total + resultados.porGene["RRR/RRK/KKK/KKR"].total} amostras</div>
            `;
            novasHipoteses.push(hipoteseHTML);
            adicionarLog("HIPÓTESE", "Bactérias com três genes W (WWW) parecem ser mais resistentes que aquelas sem genes W.");
            hipotesesGeradas = true;
        }
    }

    // Hipótese sobre escala de resistência
    const categoriasComDados = Object.entries(resultados.porGene).filter(([cat, dados]) => dados.total > 0);
    if (categoriasComDados.length === 4) { // Precisa de dados de todas as 4 categorias
        const taxaWWW = resultados.porGene["WWW"].sobreviventes / resultados.porGene["WWW"].total;
        const taxaXWW = resultados.porGene["RWW/KWW"].sobreviventes / resultados.porGene["RWW/KWW"].total;
        const taxaXXW = resultados.porGene["RRW/KKW/RKW"].sobreviventes / resultados.porGene["RRW/KKW/RKW"].total;
        const taxaXXX = resultados.porGene["RRR/RRK/KKK/KKR"].sobreviventes / resultados.porGene["RRR/RRK/KKK/KKR"].total;
        if (taxaWWW > taxaXWW && taxaXWW > taxaXXW && taxaXXW > taxaXXX) {
            const hipoteseHTML = `
                <h6>Hipótese: Escala de Resistência</h6>
                <p>A resistência parece escalar com o número de genes W: WWW > XWW > XXW > XXX.</p>
                <div class="small text-muted">Baseado em análise completa de ${resultados.total} bactérias</div>
            `;
            novasHipoteses.push(hipoteseHTML);
            adicionarLog("HIPÓTESE", "A resistência parece escalar com o número de genes W: quanto mais W, maior a resistência.");
            hipotesesGeradas = true;
            verificarPublicacaoResistencia(); // Verifica se pode publicar
        }
    }

    // Atualiza o painel de hipóteses
    if (hipotesesGeradas) {
        hipotesesContainer.innerHTML = ""; // Limpa antes de adicionar novas
        novasHipoteses.forEach(html => {
            const div = document.createElement("div");
            div.classList.add("hipotese-item", "mb-3");
            div.innerHTML = html;
            hipotesesContainer.appendChild(div);
        });
    } else if (hipotesesContainer.innerHTML.includes("Nenhuma hipótese")) {
        // Mantém a mensagem padrão se não houver hipóteses
    }
}

function verificarPublicacaoResistencia() {
    // Publica sobre resistência se todas as categorias foram observadas
    if (!publicacoes["resistencia"] && 
        descobertas.conhecimentoResistencia["WWW"] && 
        descobertas.conhecimentoResistencia["RWW/KWW"] && 
        descobertas.conhecimentoResistencia["RRW/KKW/RKW"] && 
        descobertas.conhecimentoResistencia["RRR/RRK/KKK/KKR"]) {
        
        publicacoes["resistencia"] = true;
        const publicacoesContainer = document.getElementById("publicacoes");
        const publicacaoHTML = `
            <div class="publicacao-item publicacao-resistencia mb-3">
                <h6>Publicação: Resistência Genética em Bactérias Alienígenas</h6>
                <p>Nossa pesquisa demonstra uma correlação direta entre a presença do gene W e a resistência a bacteriófagos. A resistência escala com o número de genes W (WWW: ${descobertas.valores["WWW"]}%, XWW: ${descobertas.valores["RWW/KWW"]}%, XXW: ${descobertas.valores["RRW/KKW/RKW"]}%, XXX: ${descobertas.valores["RRR/RRK/KKK/KKR"]}%)</p>
                <div class="small text-muted">Publicado no Jornal de Xenobiologia</div>
            </div>
        `;
        if (publicacoesContainer.innerHTML.includes("Nenhuma publicação")) {
            publicacoesContainer.innerHTML = publicacaoHTML;
        } else {
            publicacoesContainer.innerHTML += publicacaoHTML;
        }
        adicionarLog("PUBLICAÇÃO", "Sua descoberta sobre a escala de resistência genética foi publicada!");
        pontosPesquisa += 150;
        verificarConquistaPublicacaoRevolucionaria();
    }
}

function verificarPublicacaoDominancia() {
    // Publica sobre dominância se todas as relações foram descobertas
    if (!publicacoes["dominancia"] && 
        descobertas.dominancia["R>K"] && 
        descobertas.dominancia["K>W"] && 
        descobertas.dominancia["R>W"]) {
        
        publicacoes["dominancia"] = true;
        const publicacoesContainer = document.getElementById("publicacoes");
        const publicacaoHTML = `
            <div class="publicacao-item publicacao-dominancia mb-3">
                <h6>Publicação: Hierarquia de Dominância em Genes Alienígenas</h6>
                <p>Confirmamos a hierarquia de dominância completa entre os genes R, K e W: R domina K, e K domina W (R > K > W).</p>
                <div class="small text-muted">Publicado na Revista de Genética Extraterrestre</div>
            </div>
        `;
         if (publicacoesContainer.innerHTML.includes("Nenhuma publicação")) {
            publicacoesContainer.innerHTML = publicacaoHTML;
        } else {
            publicacoesContainer.innerHTML += publicacaoHTML;
        }
        adicionarLog("PUBLICAÇÃO", "Sua descoberta sobre a hierarquia de dominância foi publicada!");
        pontosPesquisa += 150;
        verificarConquistaPublicacaoRevolucionaria();
    }
}

function verificarConquistaPublicacaoRevolucionaria() {
    // Conquista: Publicação Revolucionária (todas as descobertas)
    if (!conquistas["publicacao_revolucionaria"] && publicacoes["resistencia"] && publicacoes["dominancia"]) {
        conquistas["publicacao_revolucionaria"] = true;
        adicionarLog("CONQUISTA", "Publicação Revolucionária: Você completou todas as descobertas genéticas e publicou seus achados!");
        pontosPesquisa += 200;
    }
}

// --- Banco de Dados e Perfil ---

function abrirBancoDados() {
    if (!jogoIniciado) {
        adicionarLog("SISTEMA", "Inicie um experimento primeiro.");
        return;
    }

    // Cria o elemento do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = '-1';
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content bg-dark text-light border border-info">
                <div class="modal-header border-bottom border-info">
                    <h5 class="modal-title">
                        <i class="fas fa-database text-info me-2"></i>Banco de Dados
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs" id="bancoDadosTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="genetica-tab" data-bs-toggle="tab" data-bs-target="#genetica-content" type="button" role="tab">Genética</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="resistencia-tab" data-bs-toggle="tab" data-bs-target="#resistencia-content" type="button" role="tab">Resistência</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="estatisticas-tab" data-bs-toggle="tab" data-bs-target="#estatisticas-content" type="button" role="tab">Estatísticas</button>
                        </li>
                    </ul>
                    <div class="tab-content p-3" id="bancoDadosTabsContent">
                        <div class="tab-pane fade show active" id="genetica-content" role="tabpanel">
                            <h6 class="mb-3">Hierarquia de Dominância Genética</h6>
                            <div id="dominancia-content">
                                ${gerarConteudoDominancia()}
                            </div>
                            <h6 class="mt-4 mb-3">Características dos Genes</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-bordered table-sm">
                                    <thead><tr><th>Gene</th><th>Característica Principal</th><th>Observações</th></tr></thead>
                                    <tbody>
                                        <tr><td class="text-danger">R</td><td>Dominância Forte</td><td>${descobertas.dominancia["R>K"] ? "Confirmado: Domina K." : ""} ${descobertas.dominancia["R>W"] ? "Confirmado: Domina W." : ""}</td></tr>
                                        <tr><td class="text-primary">K</td><td>Reprodução Rápida</td><td>${descobertas.dominancia["K>W"] ? "Confirmado: Domina W." : ""} ${descobertas.dominancia["R>K"] ? "Dominado por R." : ""}</td></tr>
                                        <tr><td class="text-success">W</td><td>Resistência a Bacteriófagos</td><td>${descobertas.conhecimentoResistencia["WWW"] ? "Confere alta resistência." : ""} ${descobertas.dominancia["K>W"] ? "Dominado por K." : ""} ${descobertas.dominancia["R>W"] ? "Dominado por R." : ""}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="resistencia-content" role="tabpanel">
                            <h6 class="mb-3">Tabela de Resistência a Bacteriófagos</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-bordered table-sm">
                                    <thead><tr><th>Composição Genética</th><th>Resistência (%)</th><th>Status</th></tr></thead>
                                    <tbody>
                                        ${gerarTabelaResistencia()}
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-4">
                                <h6 class="mb-3">Gráfico de Resistência</h6>
                                <div class="resistance-chart p-3 bg-black rounded">
                                    <div class="chart-bars d-flex align-items-end justify-content-around" style="height: 150px;">
                                        ${gerarGraficoResistencia()}
                                    </div>
                                    <div class="chart-axis d-flex justify-content-between px-4 mt-2 small">
                                        <div>0%</div><div>50%</div><div>100%</div>
                                    </div>
                                </div>
                                <div class="text-muted small mt-2 text-center">X = R ou K</div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="estatisticas-content" role="tabpanel">
                            <h6 class="mb-3">Estatísticas da Colônia Atual</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="stat-card p-3 bg-black rounded mb-3">
                                        <h6 class="text-center mb-3">Distribuição Genética</h6>
                                        <div class="distribution-chart" style="height: 150px;">
                                            ${gerarGraficoDistribuicao()}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="stat-card p-3 bg-black rounded mb-3">
                                        <h6 class="text-center mb-3">Resumo</h6>
                                        <ul class="list-unstyled small">
                                            <li>População: ${colonia.length}</li>
                                            <li>Resistência Média: ${document.getElementById("resistencia-media").textContent}</li>
                                            <li>Diversidade: ${document.getElementById("diversidade-genetica").textContent}</li>
                                            <li>Onda Atual: ${nivelOnda}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <h6 class="mt-4 mb-3">Resumo Geral do Experimento</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-bordered table-sm">
                                    <tbody>
                                        <tr><td>Total de Bactérias Criadas</td><td>${bacteriaCounter}</td></tr>
                                        <tr><td>Ondas Sobrevividas</td><td>${nivelOnda - 1}</td></tr>
                                        <tr><td>Pontos de Pesquisa</td><td>${pontosPesquisa}</td></tr>
                                        <tr><td>Eficiência Média de Sobrevivência</td><td>${nivelOnda > 1 ? Math.round(eficienciaSobrevivencia / (nivelOnda - 1)) : 0}%</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top border-info">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-info" id="exportar-dados-btn">Exportar Dados (Log)</button>
                </div>
            </div>
        </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(modalDiv);

    // Inicializa o modal Bootstrap
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();

    // Configura o evento do botão de exportação
    modalDiv.querySelector("#exportar-dados-btn").addEventListener("click", exportarLog);

    // Limpeza quando o modal for fechado
    modalDiv.addEventListener('hidden.bs.modal', () => {
        if (modalDiv.parentNode) {
            modalDiv.parentNode.removeChild(modalDiv);
        }
    });

    // Inicializa os tabs do Bootstrap
    const tabEls = modalDiv.querySelectorAll('[data-bs-toggle="tab"]');
    tabEls.forEach(tabEl => {
        new bootstrap.Tab(tabEl);
    });
}

function gerarConteudoDominancia() {
    if (!descobertas.dominancia["R>K"] && !descobertas.dominancia["K>W"] && !descobertas.dominancia["R>W"]) {
        return `<p class="text-muted small">Nenhuma relação de dominância descoberta. Cruze bactérias com genes diferentes.</p>`;
    }
    let html = 
        `<div class="dominance-diagram p-3 bg-black rounded text-center">
            <div class="d-flex justify-content-center align-items-center flex-wrap">`;
    if (descobertas.dominancia["R>K"]) {
        html += `<span class="badge bg-danger p-2 m-1">R</span> <i class="fas fa-chevron-right mx-1"></i> <span class="badge bg-primary p-2 m-1">K</span>`;
    }
    if (descobertas.dominancia["K>W"]) {
        html += `<span class="badge bg-primary p-2 m-1">K</span> <i class="fas fa-chevron-right mx-1"></i> <span class="badge bg-success p-2 m-1">W</span>`;
    }
    if (descobertas.dominancia["R>W"]) {
        html += `<span class="badge bg-danger p-2 m-1">R</span> <i class="fas fa-chevron-right mx-1"></i> <span class="badge bg-success p-2 m-1">W</span>`;
    }
    html += `</div>`;
    if (descobertas.dominancia["R>K"] && descobertas.dominancia["K>W"]) {
        html += `<p class="mt-2 small">Hierarquia completa descoberta: R > K > W.</p>`;
    } else {
        html += `<p class="mt-2 small">Hierarquia parcialmente descoberta.</p>`;
    }
    html += `</div>`;
    return html;
}

function gerarTabelaResistencia() {
    let html = "";
    const categorias = ["WWW", "RWW/KWW", "RRW/KKW/RKW", "RRR/RRK/KKK/KKR"];
    categorias.forEach(cat => {
        const conhecida = descobertas.conhecimentoResistencia[cat];
        const valor = conhecida ? descobertas.valores[cat] + "%" : "Desconhecida";
        const status = conhecida ? `<span class="badge bg-success">Confirmado</span>` : `<span class="badge bg-secondary">Não Testado</span>`;
        let label = cat;
        if (cat === "RWW/KWW") label = "XWW (X=R/K)";
        if (cat === "RRW/KKW/RKW") label = "XXW (X=R/K)";
        if (cat === "RRR/RRK/KKK/KKR") label = "XXX (X=R/K)";
        html += `<tr><td>${label}</td><td>${valor}</td><td>${status}</td></tr>`;
    });
    return html;
}

function gerarGraficoResistencia() {
    let html = "";
    const categorias = ["WWW", "RWW/KWW", "RRW/KKW/RKW", "RRR/RRK/KKK/KKR"];
    categorias.forEach(cat => {
        const conhecida = descobertas.conhecimentoResistencia[cat];
        const altura = conhecida ? descobertas.valores[cat] : 5; // Altura mínima se desconhecida
        const cor = conhecida ? "bg-success" : "bg-secondary";
        let label = cat;
        if (cat === "RWW/KWW") label = "XWW";
        if (cat === "RRW/KKW/RKW") label = "XXW";
        if (cat === "RRR/RRK/KKK/KKR") label = "XXX";
        html += 
            `<div class="chart-bar-container text-center small">
                <div class="chart-bar ${cor}" style="height: ${altura}%; width: 30px;" title="${conhecida ? descobertas.valores[cat] + '%' : 'Desconhecida'}"></div>
                <div class="mt-1">${label}</div>
            </div>`;
    });
    return html;
}

function gerarGraficoDistribuicao() {
    if (colonia.length === 0) {
        return `<p class="text-center text-muted small">Nenhuma bactéria na colônia</p>`;
    }
    const contagem = { "WWW": 0, "RWW/KWW": 0, "RRW/KKW/RKW": 0, "RRR/RRK/KKK/KKR": 0 };
    colonia.forEach(bacteria => {
        const contagemW = bacteria.genes.filter(g => g === "W").length;
        if (contagemW === 3) contagem["WWW"]++;
        else if (contagemW === 2) contagem["RWW/KWW"]++;
        else if (contagemW === 1) contagem["RRW/KKW/RKW"]++;
        else contagem["RRR/RRK/KKK/KKR"]++;
    });
    let html = `<div class="distribution-bars d-flex align-items-end justify-content-around h-100">`;
    for (const [tipo, quantidade] of Object.entries(contagem)) {
        const altura = quantidade > 0 ? (quantidade / colonia.length) * 100 : 0;
        let label = tipo, color = "bg-secondary";
        if (tipo === "WWW") { label = "WWW"; color = "bg-success"; }
        else if (tipo === "RWW/KWW") { label = "XWW"; color = "bg-info"; }
        else if (tipo === "RRW/KKW/RKW") { label = "XXW"; color = "bg-primary"; }
        else { label = "XXX"; color = "bg-danger"; }
        html += 
            `<div class="dist-bar-container text-center small">
                <div class="dist-bar ${color}" style="height: ${altura}%; width: 25px;" title="${quantidade} (${Math.round(altura)}%)"></div>
                <div class="mt-1">${label}</div>
            </div>`;
    }
    html += `</div>`;
    return html;
}

function abrirPerfilCientista() {
    if (!jogoIniciado) {
        adicionarLog("SISTEMA", "Inicie um experimento primeiro.");
        return;
    }

    // Cria o elemento do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = '-1';
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content bg-dark text-light border border-warning">
                <div class="modal-header border-bottom border-warning">
                    <h5 class="modal-title">
                        <i class="fas fa-user text-warning me-2"></i>Perfil do Cientista
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <div class="avatar-container mx-auto mb-3">
                            <i class="fas fa-user-circle fa-5x text-warning"></i>
                        </div>
                        <h5>Cientista Xenobiólogo</h5>
                        <p class="text-muted small">Laboratório de Evolução Alienígena</p>
                    </div>
                    <h6 class="border-start border-warning ps-2 mb-3">
                        Conquistas (${Object.values(conquistas).filter(c => c).length}/${Object.keys(conquistas).length})
                    </h6>
                    <div class="achievements-list" style="max-height: 150px; overflow-y: auto;">
                        ${gerarListaConquistas()}
                    </div>
                    <h6 class="border-start border-warning ps-2 mb-3 mt-4">
                        Publicações (${Object.values(publicacoes).filter(p => p).length}/${Object.keys(publicacoes).length})
                    </h6>
                    <div class="publications-list">
                        ${gerarListaPublicacoes()}
                    </div>
                    <h6 class="border-start border-warning ps-2 mb-3 mt-4">Estatísticas Gerais</h6>
                    <div class="table-responsive">
                        <table class="table table-dark table-bordered table-sm small">
                            <tbody>
                                <tr><td>Pontos de Pesquisa</td><td>${pontosPesquisa}</td></tr>
                                <tr><td>Ondas Sobrevividas</td><td>${nivelOnda - 1}</td></tr>
                                <tr><td>Eficiência Média de Sobrevivência</td><td>${nivelOnda > 1 ? Math.round(eficienciaSobrevivencia / (nivelOnda - 1)) : 0}%</td></tr>
                                <tr><td>Total de Bactérias Criadas</td><td>${bacteriaCounter}</td></tr>
                                <tr><td>Descobertas Genéticas</td><td>${calcularTotalDescobertas()}/7</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer border-top border-warning">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(modalDiv);

    // Inicializa o modal Bootstrap
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();

    // Configura o scroll para as listas
    const achievementsList = modalDiv.querySelector('.achievements-list');
    const publicationsList = modalDiv.querySelector('.publications-list');
    
    if (achievementsList.scrollHeight > achievementsList.clientHeight) {
        achievementsList.style.paddingRight = '8px'; // Adiciona espaço para a scrollbar
    }
    
    if (publicationsList.scrollHeight > publicationsList.clientHeight) {
        publicationsList.style.paddingRight = '8px';
    }

    // Limpeza quando o modal for fechado
    modalDiv.addEventListener('hidden.bs.modal', () => {
        if (modalDiv.parentNode) {
            modalDiv.parentNode.removeChild(modalDiv);
        }
    });

    // Foco no botão de fechar quando o modal é aberto
    modalDiv.addEventListener('shown.bs.modal', () => {
        modalDiv.querySelector('.btn-close').focus();
    });
}

function gerarListaConquistas() {
    const conquistasInfo = {
        "primeira_bacteria": { titulo: "Primeira Bactéria", desc: "Criar sua primeira bactéria", icone: "fa-flask", cor: "success" },
        "dominancia_rk": { titulo: "Dominância R>K", desc: "Descobrir que R domina K", icone: "fa-dna", cor: "danger" },
        "dominancia_kw": { titulo: "Dominância K>W", desc: "Descobrir que K domina W", icone: "fa-dna", cor: "primary" },
        "resistencia_www": { titulo: "Resistência Máxima", desc: "Observar a resistência das bactérias WWW", icone: "fa-shield-alt", cor: "success" },
        "colonia_diversa": { titulo: "Diversidade Genética", desc: "Manter uma colônia com alta diversidade", icone: "fa-project-diagram", cor: "info" },
        "resistencia_improvavel": { titulo: "Resistência Improvável", desc: "Ter uma bactéria com 1 gene W sobrevivendo a uma onda forte", icone: "fa-shield-virus", cor: "warning" },
        "engenheiro_genetico": { titulo: "Engenheiro Genético", desc: "Criar uma linhagem 100% resistente (WWW)", icone: "fa-award", cor: "success" },
        "caos_controlado": { titulo: "Caos Controlado", desc: "Sobreviver a um evento aleatório sem perder a colônia", icone: "fa-biohazard", cor: "danger" },
        "publicacao_revolucionaria": { titulo: "Publicação Revolucionária", desc: "Completar todas as descobertas genéticas", icone: "fa-scroll", cor: "warning" }
    };
    let html = "";
    for (const [id, obtida] of Object.entries(conquistas)) {
        const info = conquistasInfo[id];
        html += `
            <div class="achievement-item d-flex align-items-center mb-2 p-2 rounded small ${obtida ? 'bg-black' : 'bg-black opacity-50'}">
                <div class="achievement-icon me-2"><i class="fas ${info.icone} text-${info.cor}"></i></div>
                <div class="achievement-info flex-grow-1">
                    <div class="achievement-title">${info.titulo}</div>
                    <div class="achievement-desc text-muted" style="font-size: 0.8em;">${info.desc}</div>
                </div>
                <div class="achievement-status ms-auto">
                    ${obtida ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-lock text-muted"></i>'}
                </div>
            </div>
        `;
    }
    if (Object.values(conquistas).filter(c => c).length === 0) {
        html = `<p class="text-muted small">Nenhuma conquista desbloqueada.</p>`;
    }
    return html;
}

function gerarListaPublicacoes() {
    let html = "";
    if (publicacoes["resistencia"]) {
        html += `
            <div class="publication-item mb-2 small">
                <div class="publication-title">Resistência Genética em Bactérias Alienígenas</div>
                <div class="publication-journal text-muted" style="font-size: 0.8em;">Jornal de Xenobiologia</div>
            </div>
        `;
    }
    if (publicacoes["dominancia"]) {
        html += `
            <div class="publication-item mb-2 small">
                <div class="publication-title">Hierarquia de Dominância em Genes Alienígenas</div>
                <div class="publication-journal text-muted" style="font-size: 0.8em;">Revista de Genética Extraterrestre</div>
            </div>
        `;
    }
    if (html === "") {
        html = `<p class="text-muted small">Nenhuma publicação científica ainda.</p>`;
    }
    return html;
}

function calcularTotalDescobertas() {
    let total = 0;
    if (descobertas.dominancia["R>K"]) total++;
    if (descobertas.dominancia["K>W"]) total++;
    if (descobertas.dominancia["R>W"]) total++;
    if (descobertas.conhecimentoResistencia["WWW"]) total++;
    if (descobertas.conhecimentoResistencia["RWW/KWW"]) total++;
    if (descobertas.conhecimentoResistencia["RRW/KKW/RKW"]) total++;
    if (descobertas.conhecimentoResistencia["RRR/RRK/KKK/KKR"]) total++;
    return total;
}

// --- Análise e Ferramentas ---

function analisarBacteria(id) {
    const bacteria = colonia.find(b => b.id === id);
    if (!bacteria) {
        adicionarLog("ERRO", `Bactéria #${id} não encontrada.`);
        return;
    }

    // Cria o elemento do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = '-1';
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-light border border-primary">
                <div class="modal-header border-bottom border-primary">
                    <h5 class="modal-title">
                        <i class="fas fa-microscope text-primary me-2"></i>Análise de Bactéria #${bacteria.id}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-5 text-center">
                            <div class="bacteria-preview mb-3">
                                <div class="bacteria bacteria-${bacteria.genes.sort().join('') === 'WWW' ? 'W' : bacteria.genes.includes('W') ? 'W' : bacteria.genes.includes('K') ? 'K' : 'R'}" 
                                    style="width: 80px; height: 80px; position: relative; margin: 0 auto; ${bacteria.genes.includes('W') ? 'box-shadow: 0 0 15px rgba(46, 160, 67, 0.8);' : ''}"></div>
                            </div>
                            <div class="bacteria-genes">
                                <div class="d-flex justify-content-center gap-2">
                                    ${bacteria.genes.map(g => `<span class="badge ${g === 'R' ? 'bg-danger' : g === 'K' ? 'bg-primary' : 'bg-success'}">${g}</span>`).join("")}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <h6 class="mb-3">Características</h6>
                            <ul class="list-unstyled small">
                                <li>Resistência: ${bacteria.resistencia}%</li>
                                <li>Genes W: ${bacteria.genes.filter(g => g === "W").length}</li>
                                <li>Genes R: ${bacteria.genes.filter(g => g === "R").length}</li>
                                <li>Genes K: ${bacteria.genes.filter(g => g === "K").length}</li>
                                <li>Saúde: ${bacteria.saude}%</li>
                            </ul>
                            <h6 class="mt-3 mb-2">Observações</h6>
                            <p class="small text-muted">${gerarObservacoesBacteria(bacteria)}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top border-primary">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Fechar</button>
                    <button type="button" class="btn btn-primary" id="sequenciar-btn">Sequenciar Genoma</button>
                </div>
            </div>
        </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(modalDiv);

    // Inicializa o modal Bootstrap
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();

    // Configura o evento do botão de sequenciar
    modalDiv.querySelector("#sequenciar-btn").addEventListener("click", function() {
        adicionarLog("LABORATÓRIO", `Genoma da bactéria #${bacteria.id} sequenciado: ${bacteria.genes.join("")}.`);
        modal.hide();
    });

    // Limpeza quando o modal for fechado
    modalDiv.addEventListener('hidden.bs.modal', () => {
        if (modalDiv.parentNode) {
            document.body.removeChild(modalDiv);
        }
    });

    // Adiciona animação de entrada
    const bacteriaPreview = modalDiv.querySelector('.bacteria');
    setTimeout(() => {
        bacteriaPreview.style.transform = 'scale(1.1)';
        setTimeout(() => {
            bacteriaPreview.style.transform = 'scale(1)';
        }, 300);
    }, 100);

    adicionarLog("LABORATÓRIO", `Analisando bactéria #${bacteria.id} (${bacteria.genes.join("")}).`);
}

function calcularResistenciaBacteria(bacteria) {
    const contagemW = bacteria.genes.filter(g => g === "W").length;
    if (contagemW === 3) return descobertas.valores["WWW"];
    if (contagemW === 2) return descobertas.valores["RWW/KWW"];
    if (contagemW === 1) return descobertas.valores["RRW/KKW/RKW"];
    return descobertas.valores["RRR/RRK/KKK/KKR"];
}

function gerarObservacoesBacteria(bacteria) {
    const contagemW = bacteria.genes.filter(g => g === "W").length;
    const contagemR = bacteria.genes.filter(g => g === "R").length;
    const contagemK = bacteria.genes.filter(g => g === "K").length;
    let observacoes = [];
    if (contagemW === 3) observacoes.push("Resistência extremamente alta.");
    else if (contagemW === 2) observacoes.push("Boa resistência.");
    else if (contagemW === 1) observacoes.push("Resistência moderada.");
    else observacoes.push("Baixa resistência.");
    if (contagemR === 3) observacoes.push("Dominância genética R forte.");
    if (contagemK === 3) observacoes.push("Potencial de reprodução K alto.");
    if (contagemR === 1 && contagemK === 1 && contagemW === 1) observacoes.push("Genoma RKW balanceado.");
    return observacoes.join(" ") || "Nenhuma observação especial.";
}

function abrirAnalisePopulacional() {
    if (!jogoIniciado || colonia.length === 0) {
        adicionarLog("SISTEMA", "Não há colônia ativa para analisar.");
        return;
    }

    // Cria o elemento do modal
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.tabIndex = '-1';
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content bg-dark text-light border border-info">
                <div class="modal-header border-bottom border-info">
                    <h5 class="modal-title">
                        <i class="fas fa-chart-line text-info me-2"></i>Análise Populacional
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-center mb-3">Distribuição Genética</h6>
                            <div class="distribution-chart bg-black p-2 rounded" style="height: 200px;">
                                ${gerarGraficoDistribuicao()}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-center mb-3">Distribuição de Resistência</h6>
                            <div class="resistance-distribution-chart bg-black p-2 rounded" style="height: 200px;">
                                ${gerarGraficoDistribuicaoResistencia()}
                            </div>
                        </div>
                    </div>
                    <hr class="border-secondary my-4">
                    <h6 class="mb-3">Resumo da População</h6>
                    <div class="table-responsive">
                        <table class="table table-dark table-bordered table-sm small">
                            <tbody>
                                <tr><td>População Total</td><td>${colonia.length}</td></tr>
                                <tr><td>Resistência Média</td><td>${document.getElementById("resistencia-media").textContent}</td></tr>
                                <tr><td>Diversidade Genética</td><td>${document.getElementById("diversidade-genetica").textContent} (${new Set(colonia.map(b => b.genes.sort().join(""))).size} tipos)</td></tr>
                                <tr><td>Bactéria Mais Resistente</td><td>${Math.max(...colonia.map(b => b.resistencia))}%</td></tr>
                                <tr><td>Bactéria Menos Resistente</td><td>${Math.min(...colonia.map(b => b.resistencia))}%</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer border-top border-info">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    `;

    // Adiciona ao DOM
    document.body.appendChild(modalDiv);

    // Inicializa o modal Bootstrap
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();

    // Configura animações para os gráficos
    const graficos = modalDiv.querySelectorAll('.distribution-chart, .resistance-distribution-chart');
    graficos.forEach(grafico => {
        grafico.style.opacity = '0';
        setTimeout(() => {
            grafico.style.transition = 'opacity 0.5s ease';
            grafico.style.opacity = '1';
        }, 100);
    });

    // Limpeza quando o modal for fechado
    modalDiv.addEventListener('hidden.bs.modal', () => {
        if (modalDiv.parentNode) {
            document.body.removeChild(modalDiv);
        }
    });

    // Foco no modal quando aberto
    modalDiv.addEventListener('shown.bs.modal', () => {
        modalDiv.querySelector('.btn-close').focus();
    });

    adicionarLog("LABORATÓRIO", "Realizando análise populacional da colônia.");
}

function gerarGraficoDistribuicaoResistencia() {
    if (colonia.length === 0) return `<p class="text-center text-muted small">Nenhuma bactéria</p>`;
    const contagemResistencia = {
        "0-10%": 0,
        "11-40%": 0,
        "41-70%": 0,
        "71-100%": 0
    };
    colonia.forEach(b => {
        if (b.resistencia <= 10) contagemResistencia["0-10%"]++;
        else if (b.resistencia <= 40) contagemResistencia["11-40%"]++;
        else if (b.resistencia <= 70) contagemResistencia["41-70%"]++;
        else contagemResistencia["71-100%"]++;
    });
    let html = `<div class="distribution-bars d-flex align-items-end justify-content-around h-100">`;
    const cores = ["bg-danger", "bg-warning", "bg-info", "bg-success"];
    let i = 0;
    for (const [faixa, quantidade] of Object.entries(contagemResistencia)) {
        const altura = quantidade > 0 ? (quantidade / colonia.length) * 100 : 0;
        html += 
            `<div class="dist-bar-container text-center small">
                <div class="dist-bar ${cores[i]}" style="height: ${altura}%; width: 30px;" title="${quantidade} (${Math.round(altura)}%)"></div>
                <div class="mt-1">${faixa}</div>
            </div>`;
        i++;
    }
    html += `</div>`;
    return html;
}

function isolarAmostraAleatoria() {
    if (!jogoIniciado || colonia.length === 0) {
        adicionarLog("SISTEMA", "Não há colônia ativa para isolar amostra.");
        return;
    }
    const indiceAleatorio = Math.floor(Math.random() * colonia.length);
    const bacteriaIsolada = colonia[indiceAleatorio];
    adicionarLog("LABORATÓRIO", `Amostra isolada: Bactéria #${bacteriaIsolada.id} (${bacteriaIsolada.genes.join("")}).`);
    analisarBacteria(bacteriaIsolada.id); // Abre a análise da bactéria isolada
}

// --- Terminal e Comandos ---

function processarComandoTerminal() {
    const input = document.getElementById("terminal-input");
    const comando = input.value.trim();
    if (comando === "") return;
    adicionarLog("USUÁRIO", comando);
    input.value = ""; // Limpa antes de processar

    if (!jogoIniciado && comando.toLowerCase() !== "iniciar" && comando.toLowerCase() !== "ajuda") {
        adicionarLog("SISTEMA", "Nenhum experimento ativo. Digite 'iniciar' para começar.");
        return;
    }

    const partes = comando.split(" ");
    const acao = partes[0].toLowerCase();

    switch (acao) {
        case "ajuda": mostrarAjudaTerminal(); break;
        case "iniciar": iniciarExperimento(); break;
        case "criar": criarBacteriaPorComando(partes); break;
        case "criar-massa": criarBacteriasEmMassaPorComando(partes); break;
        case "analisar": analisarBacteriaPorComando(partes); break;
        case "cruzar": cruzarBacteriasPorComando(partes); break;
        case "infectar": iniciarModoInfeccao(); break;
        case "limpar": limparTerminal(); break;
        case "status": mostrarStatusColoniaTerminal(); break;
        case "descobertas": mostrarDescobertasTerminal(); break;
        case "conquistas": mostrarConquistasTerminal(); break;
        case "evento": dispararEventoAleatorio(true); break; // Força um evento para teste
        default: adicionarLog("SISTEMA", `Comando desconhecido: ${acao}. Digite 'ajuda'.`);
    }
}

function mostrarAjudaTerminal() {
    adicionarLog("SISTEMA", "Comandos disponíveis:");
    adicionarLog("AJUDA", "iniciar - Começa um novo experimento.");
    adicionarLog("AJUDA", "criar [RRR|KKK|WWW|RKW|etc] - Cria bactéria com genes específicos (ex: criar RKW). Opcional.");
    adicionarLog("AJUDA", "criar - Cria bactéria com genes aleatórios.");
    adicionarLog("AJUDA", "criar-massa [quantidade] [genes?] - Cria múltiplas bactérias (ex: criar-massa 10 RKW). Genes opcional.");
    adicionarLog("AJUDA", "analisar [id] - Analisa bactéria específica (ex: analisar 1). Clique na bactéria também funciona.");
    adicionarLog("AJUDA", "cruzar [id1] [id2] [genes1?] [genes2?] - Cruza duas bactérias (ex: cruzar 1 2). Opcional: nº genes doados (1 ou 2).");
    adicionarLog("AJUDA", "infectar - Inicia um teste de infecção com bacteriófagos.");
    adicionarLog("AJUDA", "status - Mostra o status atual da colônia.");
    adicionarLog("AJUDA", "descobertas - Lista as descobertas genéticas feitas.");
    adicionarLog("AJUDA", "conquistas - Lista as conquistas desbloqueadas.");
    adicionarLog("AJUDA", "limpar - Limpa o log do terminal.");
    adicionarLog("AJUDA", "ajuda - Mostra esta lista de comandos.");
}

function criarBacteriaPorComando(partes) {
    let genes = [];
    if (partes.length > 1 && /^[RKW]{3}$/i.test(partes[1])) {
        genes = partes[1].toUpperCase().split("");
    } else {
        const opcoesGenes = ["R", "K", "W"];
        for (let i = 0; i < 3; i++) {
            genes.push(opcoesGenes[Math.floor(Math.random() * 3)]);
        }
        if (partes.length > 1) {
             adicionarLog("SISTEMA", "Genes inválidos fornecidos, criando com genes aleatórios.");
        }
    }
    const novaBacteria = {
        id: ++bacteriaCounter,
        genes: genes,
        idade: 0,
        saude: 100,
        resistencia: calcularResistenciaBacteria({ genes: genes })
    };
    colonia.push(novaBacteria);
    atualizarStatusColonia();
    adicionarBacteriaNaCamara(novaBacteria);
    adicionarLog("LABORATÓRIO", `Bactéria #${novaBacteria.id} criada via terminal com genes ${novaBacteria.genes.join("")}. Resistência: ${novaBacteria.resistencia}%.`);
    // Conquistas
    if (!conquistas["primeira_bacteria"]) {
        conquistas["primeira_bacteria"] = true;
        adicionarLog("CONQUISTA", "Primeira Bactéria: Você criou sua primeira bactéria alienígena!");
        pontosPesquisa += 10;
    }
    if (novaBacteria.genes.join("") === "WWW" && !conquistas["engenheiro_genetico"]) {
        conquistas["engenheiro_genetico"] = true;
        adicionarLog("CONQUISTA", "Engenheiro Genético: Você criou uma linhagem 100% resistente (WWW)!");
        pontosPesquisa += 100;
    }
}

function analisarBacteriaPorComando(partes) {
    if (partes.length < 2 || isNaN(parseInt(partes[1]))) {
        adicionarLog("ERRO", "ID inválido ou não especificado. Ex: analisar 1");
        return;
    }
    analisarBacteria(parseInt(partes[1]));
}

function cruzarBacteriasPorComando(partes) {
    if (partes.length < 3 || isNaN(parseInt(partes[1])) || isNaN(parseInt(partes[2]))) {
        adicionarLog("ERRO", "IDs inválidos ou não especificados. Ex: cruzar 1 2 [genes1?] [genes2?]");
        return;
    }
    const id1 = parseInt(partes[1]);
    const id2 = parseInt(partes[2]);
    const bacteria1 = colonia.find(b => b.id === id1);
    const bacteria2 = colonia.find(b => b.id === id2);

    if (!bacteria1 || !bacteria2) {
        adicionarLog("ERRO", `Bactéria(s) #${id1} ou #${id2} não encontrada(s).`);
        return;
    }

    // Determina quantos genes cada pai doa (1 ou 2, padrão aleatório)
    let doar1 = partes.length > 3 && !isNaN(parseInt(partes[3])) ? parseInt(partes[3]) : (Math.random() < 0.5 ? 1 : 2);
    let doar2 = partes.length > 4 && !isNaN(parseInt(partes[4])) ? parseInt(partes[4]) : (Math.random() < 0.5 ? 1 : 2);
    doar1 = Math.max(1, Math.min(2, doar1)); // Garante 1 ou 2
    doar2 = Math.max(1, Math.min(2, doar2)); // Garante 1 ou 2

    const genesPai1 = [...bacteria1.genes];
    const genesPai2 = [...bacteria2.genes];
    const genesFilho = [];

    // Seleciona genes doados
    const doados1 = [];
    const doados2 = [];
    const indices = [0, 1, 2];
    // Embaralha índices para seleção aleatória
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for(let i=0; i<doar1; i++) doados1.push(genesPai1[indices[i]]);
    for(let i=0; i<doar2; i++) doados2.push(genesPai2[indices[i]]);

    // Combina genes doados (até 3)
    const poolGenes = [...doados1, ...doados2];
    while (genesFilho.length < 3 && poolGenes.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * poolGenes.length);
        genesFilho.push(poolGenes.splice(indiceAleatorio, 1)[0]);
    }
    // Completa com aleatório se faltar (improvável com doação 1 ou 2)
    while (genesFilho.length < 3) {
        genesFilho.push(["R", "K", "W"][Math.floor(Math.random() * 3)]);
    }

    // Chance de Mutação (ex: 5%)
    const taxaMutacao = 0.05;
    for (let i = 0; i < 3; i++) {
        if (Math.random() < taxaMutacao) {
            const geneAntigo = genesFilho[i];
            const opcoesMutacao = ["R", "K", "W"].filter(g => g !== geneAntigo);
            genesFilho[i] = opcoesMutacao[Math.floor(Math.random() * opcoesMutacao.length)];
            adicionarLog("ALERTA", `Mutação detectada durante cruzamento! Gene ${geneAntigo} -> ${genesFilho[i]} na Bactéria #${bacteriaCounter + 1}.`);
        }
    }

    const novaBacteria = {
        id: ++bacteriaCounter,
        genes: genesFilho,
        idade: 0,
        saude: 100,
        resistencia: calcularResistenciaBacteria({ genes: genesFilho })
    };
    colonia.push(novaBacteria);
    atualizarStatusColonia();
    adicionarBacteriaNaCamara(novaBacteria);
    adicionarLog("LABORATÓRIO", `Cruzamento: #${id1}(${doar1}) + #${id2}(${doar2}) -> #${novaBacteria.id} (${novaBacteria.genes.join("")}). Resistência: ${novaBacteria.resistencia}%.`);

    // Verificar descobertas de dominância
    verificarDescobertaDominancia(bacteria1, bacteria2, novaBacteria);
}

function verificarDescobertaDominancia(pai1, pai2, filho) {
    for (let i = 0; i < 3; i++) {
        const g1 = pai1.genes[i];
        const g2 = pai2.genes[i];
        const gf = filho.genes[i];
        if (g1 !== g2) {
            if (gf === g1) registrarDominancia(g1, g2);
            if (gf === g2) registrarDominancia(g2, g1);
        }
    }
}

function registrarDominancia(dominante, dominado) {
    const chave = `${dominante}>${dominado}`;
    if (!descobertas.dominancia[chave]) {
        descobertas.dominancia[chave] = true;
        adicionarLog("DESCOBERTA", `Relação de dominância observada: ${dominante} domina ${dominado}.`);
        pontosPesquisa += 30;
        // Conquistas
        if (chave === "R>K" && !conquistas["dominancia_rk"]) {
            conquistas["dominancia_rk"] = true;
            adicionarLog("CONQUISTA", "Dominância R>K: Você descobriu que R domina K!");
            pontosPesquisa += 20;
        }
        if (chave === "K>W" && !conquistas["dominancia_kw"]) {
            conquistas["dominancia_kw"] = true;
            adicionarLog("CONQUISTA", "Dominância K>W: Você descobriu que K domina W!");
            pontosPesquisa += 20;
        }
        atualizarProgressoDescoberta();
        verificarPublicacaoDominancia();
    }
}

function mostrarStatusColoniaTerminal() {
    adicionarLog("STATUS", `População: ${colonia.length}, Resistência Média: ${document.getElementById("resistencia-media").textContent}, Diversidade: ${document.getElementById("diversidade-genetica").textContent}, Onda Atual: ${nivelOnda}`);
}

function mostrarDescobertasTerminal() {
    adicionarLog("SISTEMA", "Descobertas Genéticas:");
    let algumaDescoberta = false;
    for (const [chave, descoberta] of Object.entries(descobertas.dominancia)) {
        if (descoberta) {
            adicionarLog("DESCOBERTA", `Dominância: ${chave}`);
            algumaDescoberta = true;
        }
    }
    for (const [chave, descoberta] of Object.entries(descobertas.conhecimentoResistencia)) {
        if (descoberta) {
            adicionarLog("DESCOBERTA", `Resistência ${chave}: ${descobertas.valores[chave]}%`);
            algumaDescoberta = true;
        }
    }
    if (!algumaDescoberta) {
        adicionarLog("SISTEMA", "Nenhuma descoberta registrada ainda.");
    }
}

function mostrarConquistasTerminal() {
     adicionarLog("SISTEMA", "Conquistas Desbloqueadas:");
     let algumaConquista = false;
     for (const [id, obtida] of Object.entries(conquistas)) {
         if (obtida) {
             const titulo = id.replace(/_/g, ' ').replace(/\w/g, l => l.toUpperCase()); // Formata o título
             adicionarLog("CONQUISTA", titulo);
             algumaConquista = true;
         }
     }
     if (!algumaConquista) {
         adicionarLog("SISTEMA", "Nenhuma conquista desbloqueada ainda.");
     }
}

// --- Eventos Aleatórios ---

function verificarEventoAleatorio() {
    if (!jogoIniciado || colonia.length < 5) return; // Precisa de uma colônia mínima

    const agora = Date.now();
    if (agora - ultimoEvento > INTERVALO_EVENTO) {
        if (Math.random() < 0.2) { // 20% de chance a cada verificação após o intervalo
            dispararEventoAleatorio();
            ultimoEvento = agora;
        }
    }
}

function dispararEventoAleatorio(forcar = false) {
    if (!jogoIniciado && !forcar) return;
    if (colonia.length === 0 && !forcar) return;

    const eventos = ["vazamentoMutagenico", "surtoHipermutacao", "falhaQuarentena"];
    const eventoEscolhido = eventos[Math.floor(Math.random() * eventos.length)];
    let sobreviveuEvento = true; // Assume que sobreviveu inicialmente

    adicionarLog("ALERTA", "Evento Aleatório Detectado!");

    switch (eventoEscolhido) {
        case "vazamentoMutagenico":
            adicionarLog("EVENTO", "Vazamento de Mutagênico! Alguns genes na colônia foram aleatorizados.");
            const afetadosMutagenico = Math.min(colonia.length, Math.ceil(colonia.length * 0.3)); // Afeta até 30%
            for (let i = 0; i < afetadosMutagenico; i++) {
                const indice = Math.floor(Math.random() * colonia.length);
                const bacteria = colonia[indice];
                const geneIndex = Math.floor(Math.random() * 3);
                const geneAntigo = bacteria.genes[geneIndex];
                const opcoes = ["R", "K", "W"];
                bacteria.genes[geneIndex] = opcoes[Math.floor(Math.random() * 3)];
                bacteria.resistencia = calcularResistenciaBacteria(bacteria); // Recalcula resistência
                adicionarLog("MUTAÇÃO", `Bactéria #${bacteria.id}: Gene na posição ${geneIndex + 1} mutou de ${geneAntigo} para ${bacteria.genes[geneIndex]}.`);
                // Atualiza visualização se necessário (pode ser complexo)
            }
            atualizarStatusColonia();
            break;

        case "surtoHipermutacao":
            adicionarLog("EVENTO", "Surto de Hipermutação! A taxa de mutação aumentará temporariamente nos próximos cruzamentos.");
            // Implementar lógica para aumentar taxa de mutação temporariamente (ex: flag global)
            // Por simplicidade, vamos apenas logar por enquanto.
            break;

        case "falhaQuarentena":
            adicionarLog("EVENTO", "Falha no Sistema de Quarentena! Vírus escaparam e estão atacando a colônia fora de hora!");
            // Simula uma infecção imediata com a dificuldade atual
            const resultadosQuarentena = processarResultadosInfeccaoImediata();
            if (resultadosQuarentena.mortos === resultadosQuarentena.total) {
                sobreviveuEvento = false; // Colônia exterminada
            }
            break;
    }
    
    // Conquista: Caos Controlado
    if (sobreviveuEvento && !conquistas["caos_controlado"]) {
        conquistas["caos_controlado"] = true;
        adicionarLog("CONQUISTA", "Caos Controlado: Você sobreviveu a um evento aleatório sem perder a colônia!");
        pontosPesquisa += 80;
    }
}

// Função auxiliar para evento de falha na quarentena
function processarResultadosInfeccaoImediata() {
    const coloniaAntes = [...colonia];
    const resultados = { total: coloniaAntes.length, sobreviventes: 0, mortos: 0 };
    const fatorDificuldade = 1 + (nivelOnda - 1) * 0.1;

    coloniaAntes.forEach(bacteria => {
        const chanceSobreviver = Math.max(0, bacteria.resistencia / fatorDificuldade);
        const sobreviveu = Math.random() * 100 < chanceSobreviver;
        const bacteriaEl = document.querySelector(`.bacteria[data-id="${bacteria.id}"]`);

        if (sobreviveu) {
            resultados.sobreviventes++;
            if (bacteriaEl) {
                bacteriaEl.classList.add("survived-infection");
                setTimeout(() => bacteriaEl.classList.remove("survived-infection"), 1000);
            }
        } else {
            resultados.mortos++;
            colonia = colonia.filter(b => b.id !== bacteria.id);
            if (bacteriaEl) {
                bacteriaEl.classList.add("dying");
                setTimeout(() => {
                    if (bacteriaEl.parentNode) bacteriaEl.parentNode.removeChild(bacteriaEl);
                }, 1000);
            }
        }
    });

    atualizarStatusColonia();
    const taxaSobrevivencia = resultados.total > 0 ? Math.round(resultados.sobreviventes / resultados.total * 100) : 0;
    adicionarLog("LABORATÓRIO", `Resultado da Falha na Quarentena: Sobreviventes: ${resultados.sobreviventes}/${resultados.total} (${taxaSobrevivencia}%).`);
    if (resultados.mortos === resultados.total) {
         adicionarLog("ALERTA", "Toda a colônia foi exterminada pela falha na quarentena!");
    }
    return resultados; // Retorna para verificar a conquista
}

// --- Funções Utilitárias ---

function adicionarLog(tipo, mensagem) {
    const terminalOutput = document.getElementById("terminal-output");
    const logEntry = document.createElement("div");
    logEntry.classList.add("log-entry");
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString("pt-BR");
    let corTipo = "text-light";
    let icone = "";

    switch (tipo) {
        case "SISTEMA": corTipo = "text-info"; icone = "<i class='fas fa-info-circle me-1'></i>"; break;
        case "LABORATÓRIO": corTipo = "text-success"; icone = "<i class='fas fa-flask me-1'></i>"; break;
        case "ERRO": corTipo = "text-danger"; icone = "<i class='fas fa-exclamation-triangle me-1'></i>"; break;
        case "ALERTA": corTipo = "text-warning"; icone = "<i class='fas fa-exclamation-circle me-1'></i>"; break;
        case "USUÁRIO": corTipo = "text-light"; icone = "<i class='fas fa-user me-1'></i>"; break;
        case "DESCOBERTA": corTipo = "text-warning"; icone = "<i class='fas fa-lightbulb me-1'></i>"; break;
        case "HIPÓTESE": corTipo = "text-primary"; icone = "<i class='fas fa-brain me-1'></i>"; break;
        case "PUBLICAÇÃO": corTipo = "text-success"; icone = "<i class='fas fa-scroll me-1'></i>"; break;
        case "DADOS": corTipo = "text-info"; icone = "<i class='fas fa-database me-1'></i>"; break;
        case "AJUDA": corTipo = "text-muted"; icone = "<i class='fas fa-question-circle me-1'></i>"; break;
        case "DICA": corTipo = "text-warning"; icone = "<i class='fas fa-star me-1'></i>"; break;
        case "CONQUISTA": corTipo = "text-warning"; icone = "<i class='fas fa-trophy me-1'></i>"; break;
        case "EVENTO": corTipo = "text-danger"; icone = "<i class='fas fa-biohazard me-1'></i>"; break;
        case "MUTAÇÃO": corTipo = "text-warning"; icone = "<i class='fas fa-atom me-1'></i>"; break;
        case "STATUS": corTipo = "text-info"; icone = "<i class='fas fa-chart-bar me-1'></i>"; break;
    }

    logEntry.innerHTML = `
        <span class="log-time">[${horaFormatada}]</span>
        <span class="log-system ${corTipo}">${icone}${tipo}:</span>
        <span class="log-message">${mensagem}</span>
    `;
    terminalOutput.appendChild(logEntry);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function limparTerminal() {
    document.getElementById("terminal-output").innerHTML = "";
    adicionarLog("SISTEMA", "Terminal limpo.");
}

function exportarLog() {
    const terminalOutput = document.getElementById("terminal-output");
    let logContent = "";
    terminalOutput.querySelectorAll(".log-entry").forEach(entry => {
        logContent += entry.textContent.trim() + "\n";
    });
    
    if (!logContent) {
        adicionarLog("SISTEMA", "Log vazio, nada para exportar.");
        return;
    }

    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `xenobiology_log_${new Date().toISOString().slice(0,10)}.txt`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    adicionarLog("SISTEMA", "Log de eventos exportado como arquivo de texto.");
}

// --- Fim do Script ---
