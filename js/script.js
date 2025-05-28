// Seleciona os elementos HTML onde os carros serão exibidos e o modal
const carListingsContainer = document.getElementById('car-listings');
const carModal = document.getElementById('car-modal');
const modalDetails = document.getElementById('modal-details');
const closeButton = document.querySelector('.close-button'); // Botão 'x' do modal

// --- FUNÇÕES DE LÓGICA DO SITE ---

// Função para carregar os dados dos veículos do arquivo JSON
async function carregarVeiculos() {
    try {
        // Tenta buscar o arquivo veiculos.json na pasta 'data'
        const response = await fetch('./data/veiculos.json');
        // Verifica se a resposta da requisição foi bem-sucedida (status 200 OK, por exemplo)
        if (!response.ok) {
            // Se a resposta não for OK (ex: arquivo não encontrado), lança um erro
            throw new Error(`HTTP error! status: ${response.status} - Caminho: ./data/veiculos.json`);
        }
        // Converte a resposta (texto JSON) para um objeto JavaScript
        const veiculos = await response.json();
        
        // Chama a função para exibir os carros na tela
        renderizarCartoesDeCarros(veiculos);

    } catch (error) {
        // Captura e exibe qualquer erro que ocorra durante o carregamento
        console.error('Erro ao carregar os veículos:', error);
        // Exibe uma mensagem de erro amigável na página
        carListingsContainer.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar os veículos. Verifique o console para mais detalhes ou se o arquivo veiculos.json existe e está correto.</p>';
    }
}

// Função para criar e exibir os cartões de cada carro na página
function renderizarCartoesDeCarros(listaDeCarros) {
    // Limpa o conteúdo atual do container para evitar duplicações ao recarregar a lista
    carListingsContainer.innerHTML = '';

    // Itera sobre cada objeto de carro na lista
    listaDeCarros.forEach(carro => {
        // Cria um novo elemento div para representar o cartão de cada carro
        const card = document.createElement('div');
        card.classList.add('car-card'); // Adiciona uma classe para estilização via CSS

        // Preenche o HTML interno do cartão com os dados do carro
        // Observação: carro.imagens[0] pega a primeira imagem da lista para a capa do cartão
        card.innerHTML = `
            <img src="${carro.imagens[0]}" alt="${carro.marca} ${carro.modelo}">
            <h3>${carro.marca} ${carro.modelo}</h3>
            <p>Ano: ${carro.ano} | ${carro.quilometragem}</p>
            <p class="preco">${carro.preco}</p>
            <button class="btn-ver-detalhes" data-id="${carro.id}">Ver Detalhes</button>
        `;
        
        // Adiciona o cartão criado ao container principal de listagens de carros no HTML
        carListingsContainer.appendChild(card);
    });

    // Adiciona ouvintes de evento de clique a TODOS os botões "Ver Detalhes" criados
    document.querySelectorAll('.btn-ver-detalhes').forEach(button => {
        button.addEventListener('click', (event) => {
            // Pega o ID do carro do atributo 'data-id' do botão clicado
            const carroId = parseInt(event.target.dataset.id);
            // Encontra o objeto do carro correspondente na lista original de veículos
            const carroSelecionado = listaDeCarros.find(carro => carro.id === carroId);
            // Chama a função para abrir o modal com os detalhes desse carro
            abrirModalCarro(carroSelecionado);
        });
    });
}

// Função para abrir o modal com os detalhes de um carro específico
function abrirModalCarro(carro) {
    if (!carro) return; // Se por algum motivo o objeto carro não existir, não faz nada

    // Limpa qualquer conteúdo anterior do modal de detalhes
    modalDetails.innerHTML = '';

    // Constrói a galeria de imagens para o modal
    let galleryHtml = '';
    if (carro.imagens && carro.imagens.length > 0) {
        // A primeira imagem da lista será a imagem principal do modal
        galleryHtml = `
            <div class="modal-gallery">
                <img src="${carro.imagens[0]}" alt="${carro.marca} ${carro.modelo}" class="main-modal-image">
                <div class="thumbnail-images">
                    ${carro.imagens.map((imgSrc, index) => 
                        // Cria miniaturas clicáveis para as outras imagens
                        `<img src="${imgSrc}" alt="${carro.modelo} ${index + 1}" class="thumbnail" data-index="${index}">`
                    ).join('')}
                </div>
            </div>
        `;
    }

    // Preenche o HTML do conteúdo do modal com todas as informações detalhadas do carro
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

    // Adiciona funcionalidade para mudar a imagem principal na galeria do modal
    // Se houver mais de uma imagem, habilita o clique nas miniaturas
    if (carro.imagens && carro.imagens.length > 1) {
        const mainModalImage = modalDetails.querySelector('.main-modal-image');
        modalDetails.querySelectorAll('.thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', (event) => {
                // Altera a fonte da imagem principal para a fonte da miniatura clicada
                mainModalImage.src = event.target.src;
                // Opcional: Adicionar/remover classe 'active' para a miniatura selecionada
                modalDetails.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                event.target.classList.add('active');
            });
        });
    }

    // Exibe o modal e impede a rolagem da página principal
    carModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

// Função para fechar o modal
function fecharModalCarro() {
    // Oculta o modal e restaura a rolagem da página principal
    carModal.style.display = 'none';
    document.body.style.overflow = 'auto'; 
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

// --- INICIALIZAÇÃO ---

// Carrega os veículos assim que todo o conteúdo do DOM (HTML) estiver completamente carregado
document.addEventListener('DOMContentLoaded', carregarVeiculos);