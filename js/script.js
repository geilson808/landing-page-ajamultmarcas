// Seleciona os elementos HTML onde os carros serão exibidos e o modal
const carListingsContainer = document.getElementById('car-listings');
const carModal = document.getElementById('car-modal');
const modalDetails = document.getElementById('modal-details');
const closeButton = document.querySelector('.close-button'); // Botão 'x' do modal

// NOVO: Seleciona o input de pesquisa
const searchInput = document.getElementById('search-input'); // Seleciona o input da barra de pesquisa

// Variável para armazenar todos os veículos carregados inicialmente
let allVehicles = []; // Esta variável vai guardar a lista completa

// --- FUNÇÕES DE LÓGICA DO SITE ---

// Função para carregar os dados dos veículos do arquivo JSON
async function carregarVeiculos() {
    try {
        const response = await fetch('./data/veiculos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Caminho: ./data/veiculos.json`);
        }
        const veiculos = await response.json();
        
        // NOVO: Armazena a lista completa de veículos
        allVehicles = veiculos; 

        // Chama a função para exibir os carros na tela (todos, inicialmente)
        renderizarCartoesDeCarros(allVehicles); // Usa allVehicles aqui

    } catch (error) {
        console.error('Erro ao carregar os veículos:', error);
        carListingsContainer.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar os veículos. Verifique o console para mais detalhes ou se o arquivo veiculos.json existe e está correto.</p>';
    }
}

// Função para criar e exibir os cartões de cada carro na página
// AGORA RECEBE UMA LISTA (que pode ser filtrada)
function renderizarCartoesDeCarros(listaDeCarros) {
    carListingsContainer.innerHTML = ''; // Limpa o conteúdo atual

    if (listaDeCarros.length === 0) {
        carListingsContainer.innerHTML = '<p style="text-align: center; font-size: 1.2em; color: #555;">Nenhum veículo encontrado para sua pesquisa.</p>';
        return; // Sai da função se não houver carros
    }

    listaDeCarros.forEach(carro => {
        const card = document.createElement('div');
        card.classList.add('car-card');
        card.innerHTML = `
            <img src="${carro.imagens[0]}" alt="${carro.marca} ${carro.modelo}">
            <h3>${carro.marca} ${carro.modelo}</h3>
            <p>Ano: ${carro.ano} | ${carro.quilometragem}</p>
            <p class="preco">${carro.preco}</p>
            <button class="btn-ver-detalhes" data-id="${carro.id}">Ver Detalhes</button>
        `;
        carListingsContainer.appendChild(card);
    });

    // Adiciona ouvintes de evento de clique a TODOS os botões "Ver Detalhes" criados
    document.querySelectorAll('.btn-ver-detalhes').forEach(button => {
        button.addEventListener('click', (event) => {
            const carroId = parseInt(event.target.dataset.id);
            const carroSelecionado = allVehicles.find(carro => carro.id === carroId); // Usa allVehicles para encontrar o carro
            abrirModalCarro(carroSelecionado);
        });
    });
}

// Função para abrir o modal com os detalhes de um carro específico
function abrirModalCarro(carro) {
    if (!carro) return;

    modalDetails.innerHTML = '';

    let galleryHtml = '';
    if (carro.imagens && carro.imagens.length > 0) {
        galleryHtml = `
            <div class="modal-gallery">
                <img src="${carro.imagens[0]}" alt="${carro.marca} ${carro.modelo}" class="main-modal-image">
                <div class="thumbnail-images">
                    ${carro.imagens.map((imgSrc, index) => 
                        `<img src="${imgSrc}" alt="${carro.modelo} ${index + 1}" class="thumbnail" data-index="${index}">`
                    ).join('')}
                </div>
            </div>
        `;
    }

    modalDetails.innerHTML = `
        ${galleryHtml}
        <h2>${carro.marca} ${carro.modelo}</h2>
        <p class="modal-preco">Preço: ${carro.preco}</p>
        <p><strong>Ano:</strong> ${carro.ano}</p>
        <p><strong>Quilometragem:</strong> ${carro.quilometragem}</p>
        <p><strong>Cor:</strong> ${carro.cor}</p>
        <p><strong>Câmbio:</strong> ${carro.cambio}</p>
        <p><strong>Combustível:</strong> ${carro.combustivel}</p>
        <p><strong>Descrição:</strong> ${carro.descricaoDetalhada}</p>
        <div class="modal-buttons">
            <a href="https://wa.me/${carro.contatoWhatsApp}?text=Olá! Tenho interesse no ${carro.marca} ${carro.modelo} ${carro.ano} anunciado no site da AJA Multimarcas. Poderíamos conversar?" target="_blank" class="btn-whatsapp">
                <img src="img/carros/whatsapp-icon.png" alt="WhatsApp" style="width: 20px; vertical-align: middle; margin-right: 5px;"> Chamar no WhatsApp
            </a>
            <a href="tel:+${carro.contatoTelefone}" class="btn-telefone">
                <img src="img/carros/phone-icon.png" alt="Telefone" style="width: 20px; vertical-align: middle; margin-right: 5px;"> Ligar para ${carro.contatoTelefone}
            </a>
        </div>
    `;

    if (carro.imagens && carro.imagens.length > 1) {
        const mainModalImage = modalDetails.querySelector('.main-modal-image');
        modalDetails.querySelectorAll('.thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', (event) => {
                mainModalImage.src = event.target.src;
                modalDetails.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                event.target.classList.add('active');
            });
        });
    }

    carModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

// Função para fechar o modal
function fecharModalCarro() {
    carModal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
}

// NOVO: Função para filtrar os veículos com base na pesquisa
function filtrarVeiculos() {
    const searchTerm = searchInput.value.toLowerCase(); // Pega o texto do input e converte para minúsculas

    // Filtra a lista completa de veículos
    const filteredVehicles = allVehicles.filter(carro => {
        // Converte os campos relevantes do carro para minúsculas para comparação
        const marca = carro.marca.toLowerCase();
        const modelo = carro.modelo.toLowerCase();
        const ano = carro.ano.toString().toLowerCase(); // Ano pode ser número, converte para string
        const cor = carro.cor.toLowerCase();
        const combustivel = carro.combustivel.toLowerCase();
        const cambio = carro.cambio.toLowerCase();
        const descricao = carro.descricaoDetalhada.toLowerCase();


        // Retorna true se qualquer um dos campos contiver o termo de pesquisa
        return marca.includes(searchTerm) ||
               modelo.includes(searchTerm) ||
               ano.includes(searchTerm) ||
               cor.includes(searchTerm) ||
               combustivel.includes(searchTerm) ||
               cambio.includes(searchTerm) ||
               descricao.includes(searchTerm);
    });

    // Renderiza a lista de carros filtrada
    renderizarCartoesDeCarros(filteredVehicles);
}


// --- EVENT LISTENERS GLOBAIS ---

// Adiciona ouvinte de evento para fechar o modal ao clicar no botão 'x'
closeButton.addEventListener('click', fecharModalCarro);

// Adiciona ouvinte de evento para fechar o modal ao clicar fora da área de conteúdo do modal
window.addEventListener('click', (event) => {
    if (event.target === carModal) { // Verifica se o clique foi no fundo escuro do modal
        fecharModalCarro();
    }
});

// NOVO: Adiciona ouvinte de evento para o input de pesquisa
// A cada vez que o usuário digitar ou apagar algo, a função filtrarVeiculos será chamada
searchInput.addEventListener('input', filtrarVeiculos);


// --- INICIALIZAÇÃO ---

// Carrega os veículos assim que todo o conteúdo do DOM (HTML) estiver completamente carregado
document.addEventListener('DOMContentLoaded', carregarVeiculos);