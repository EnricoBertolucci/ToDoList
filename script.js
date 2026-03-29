// Array que armazena todas as tarefas em memoria
var tarefas = [];

// Variaveis de controle da edicao
var modoEdicao = false;
var idEmEdicao = null;

// Filtro e busca ativos
var filtroAtivo = 'todos';
var termoBusca = '';

// =============================================================
// LOCALSTORAGE - salvar e carregar dados
// =============================================================

// Salva o array de tarefas no localStorage como JSON
function salvarNoLocalStorage() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Carrega as tarefas salvas do localStorage
function carregarDoLocalStorage() {
  var dados = localStorage.getItem('tarefas');
  if (dados) {
    tarefas = JSON.parse(dados);
  } else {
    tarefas = [];
  }
}

// =============================================================
// VALIDACAO - verificar campos obrigatorios
// =============================================================

// Valida se titulo e descricao foram preenchidos
// Retorna true se valido, false caso contrario
function validarFormulario() {
  var valido = true;

  var titulo = document.querySelector('#titulo').value.trim();
  var descricao = document.querySelector('#descricao').value.trim();

  // Verifica o titulo
  if (titulo === '') {
    document.querySelector('#titulo').classList.add('invalido');
    document.querySelector('#erro-titulo').classList.add('visivel');
    valido = false;
  } else {
    document.querySelector('#titulo').classList.remove('invalido');
    document.querySelector('#erro-titulo').classList.remove('visivel');
  }

  // Verifica a descricao
  if (descricao === '') {
    document.querySelector('#descricao').classList.add('invalido');
    document.querySelector('#erro-descricao').classList.add('visivel');
    valido = false;
  } else {
    document.querySelector('#descricao').classList.remove('invalido');
    document.querySelector('#erro-descricao').classList.remove('visivel');
  }

  return valido;
}

// =============================================================
// CADASTRO - adicionar nova tarefa
// =============================================================

function cadastrarTarefa() {
  // Impede o cadastro se houver campos invalidos
  if (!validarFormulario()) return;

  // Cria o objeto com os dados do formulario
  var novaTarefa = {
    id: Date.now(),
    titulo: document.querySelector('#titulo').value.trim(),
    descricao: document.querySelector('#descricao').value.trim(),
    dataCriacao: document.querySelector('#dataCriacao').value,
    prioridade: document.querySelector('#prioridade').value,
    status: document.querySelector('#status').value
  };

  // Adiciona ao array e salva
  tarefas.push(novaTarefa);
  salvarNoLocalStorage();

  // Atualiza a tela e limpa o formulario
  listarTarefas();
  limparFormulario();
}

// =============================================================
// LISTAGEM - renderizar tarefas na tela
// =============================================================

function listarTarefas() {
  var lista = document.querySelector('#listaTarefas');
  var mensagemVazia = document.querySelector('#mensagemVazia');
  var contador = document.querySelector('#contadorTarefas');

  // Aplica o filtro de status/prioridade
  var tarefasFiltradas = [];
  for (var i = 0; i < tarefas.length; i++) {
    var t = tarefas[i];

    if (filtroAtivo === 'pendente'  && t.status !== 'pendente')   continue;
    if (filtroAtivo === 'concluida' && t.status !== 'concluida')  continue;
    if (filtroAtivo === 'alta'      && t.prioridade !== 'alta')   continue;
    if (filtroAtivo === 'media'     && t.prioridade !== 'media')  continue;
    if (filtroAtivo === 'baixa'     && t.prioridade !== 'baixa')  continue;

    tarefasFiltradas.push(t);
  }

  // Aplica a busca por titulo
  if (termoBusca.trim() !== '') {
    var termo = termoBusca.toLowerCase();
    var resultado = [];
    for (var j = 0; j < tarefasFiltradas.length; j++) {
      if (tarefasFiltradas[j].titulo.toLowerCase().indexOf(termo) !== -1) {
        resultado.push(tarefasFiltradas[j]);
      }
    }
    tarefasFiltradas = resultado;
  }

  // Atualiza o contador com o total de tarefas (sem filtro)
  contador.textContent = tarefas.length;

  // Limpa a lista antes de re-renderizar
  lista.innerHTML = '';

  // Exibe mensagem se a lista estiver vazia
  if (tarefasFiltradas.length === 0) {
    mensagemVazia.classList.add('visivel');
    return;
  }

  mensagemVazia.classList.remove('visivel');

  // Cria um card para cada tarefa filtrada
  for (var k = 0; k < tarefasFiltradas.length; k++) {
    var card = criarCard(tarefasFiltradas[k]);
    lista.appendChild(card);
  }
}

// =============================================================
// CRIACAO DE CARD - manipulacao do DOM
// =============================================================

// Cria e retorna o elemento HTML do card de uma tarefa
function criarCard(tarefa) {
  var concluida = tarefa.status === 'concluida';

  // Converte data de YYYY-MM-DD para DD/MM/YYYY
  var dataFormatada = '—';
  if (tarefa.dataCriacao) {
    var partes = tarefa.dataCriacao.split('-');
    dataFormatada = partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  // Texto do badge de prioridade
  var textoPrioridade = tarefa.prioridade;
  if (tarefa.prioridade === 'media') textoPrioridade = 'Media';
  if (tarefa.prioridade === 'alta')  textoPrioridade = 'Alta';
  if (tarefa.prioridade === 'baixa') textoPrioridade = 'Baixa';

  // Cria o elemento principal do card usando createElement
  var card = document.createElement('div');
  card.classList.add('card-tarefa');
  card.classList.add('prioridade-' + tarefa.prioridade);

  if (concluida) {
    card.classList.add('concluida');
  }

  // Monta o HTML interno do card
  var botaoConcluir = '';
  if (concluida) {
    botaoConcluir = '<button class="btn-acao btn-reabrir" onclick="marcarConcluida(' + tarefa.id + ')">Reabrir</button>';
  } else {
    botaoConcluir = '<button class="btn-acao btn-concluir" onclick="marcarConcluida(' + tarefa.id + ')">Concluir</button>';
  }

  card.innerHTML =
    '<div class="card-topo">' +
      '<span class="titulo-tarefa">' + tarefa.titulo + '</span>' +
      '<div class="badges">' +
        '<span class="badge badge-' + tarefa.prioridade + '">' + textoPrioridade + '</span>' +
        '<span class="badge badge-' + tarefa.status + '">' + (concluida ? 'Concluida' : 'Pendente') + '</span>' +
      '</div>' +
    '</div>' +
    '<p class="descricao-tarefa">' + tarefa.descricao + '</p>' +
    '<div class="card-rodape">' +
      '<span class="data-tarefa">Criado em: ' + dataFormatada + '</span>' +
      '<div class="acoes">' +
        botaoConcluir +
        '<button class="btn-acao btn-editar" onclick="editarTarefa(' + tarefa.id + ')">Editar</button>' +
        '<button class="btn-acao btn-excluir" onclick="excluirTarefa(' + tarefa.id + ')">Excluir</button>' +
      '</div>' +
    '</div>';

  return card;
}

// =============================================================
// BUSCA - filtrar por titulo em tempo real
// =============================================================

function buscarTarefa() {
  termoBusca = document.querySelector('#campoBusca').value;
  listarTarefas();
}

// =============================================================
// EDICAO - carregar dados no formulario
// =============================================================

function editarTarefa(id) {
  // Encontra a tarefa pelo id
  var tarefa = null;
  for (var i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id === id) {
      tarefa = tarefas[i];
      break;
    }
  }

  if (!tarefa) return;

  // Preenche o formulario com os dados da tarefa
  document.querySelector('#titulo').value = tarefa.titulo;
  document.querySelector('#descricao').value = tarefa.descricao;
  document.querySelector('#dataCriacao').value = tarefa.dataCriacao;
  document.querySelector('#prioridade').value = tarefa.prioridade;
  document.querySelector('#status').value = tarefa.status;

  // Ativa o modo de edicao
  modoEdicao = true;
  idEmEdicao = id;

  document.querySelector('#btnCadastrar').textContent = 'Salvar Edicao';
  document.querySelector('#titulo-formulario').textContent = 'Editando Tarefa';

  // Rola a pagina ate o formulario
  document.querySelector('#secao-formulario').scrollIntoView({ behavior: 'smooth' });
}

// Salva as alteracoes da tarefa em edicao
function salvarEdicao(id) {
  if (!validarFormulario()) return;

  // Encontra o indice da tarefa no array
  var indice = -1;
  for (var i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id === id) {
      indice = i;
      break;
    }
  }

  if (indice === -1) return;

  // Atualiza os dados da tarefa
  tarefas[indice].titulo = document.querySelector('#titulo').value.trim();
  tarefas[indice].descricao = document.querySelector('#descricao').value.trim();
  tarefas[indice].dataCriacao = document.querySelector('#dataCriacao').value;
  tarefas[indice].prioridade = document.querySelector('#prioridade').value;
  tarefas[indice].status = document.querySelector('#status').value;

  salvarNoLocalStorage();
  listarTarefas();
  limparFormulario();
}

// =============================================================
// EXCLUSAO - remover tarefa do array
// =============================================================

function excluirTarefa(id) {
  // Pede confirmacao antes de excluir
  var confirmar = confirm('Deseja excluir esta tarefa? Esta acao nao pode ser desfeita.');

  if (!confirmar) return;

  // Cria um novo array sem a tarefa excluida
  var novaLista = [];
  for (var i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id !== id) {
      novaLista.push(tarefas[i]);
    }
  }
  tarefas = novaLista;

  // Se a tarefa excluida estava em edicao, cancela
  if (modoEdicao && idEmEdicao === id) {
    limparFormulario();
  }

  salvarNoLocalStorage();
  listarTarefas();
}

// =============================================================
// ALTERNAR STATUS - marcar como concluida ou reabrir
// =============================================================

function marcarConcluida(id) {
  for (var i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id === id) {
      // Alterna entre pendente e concluida
      if (tarefas[i].status === 'pendente') {
        tarefas[i].status = 'concluida';
      } else {
        tarefas[i].status = 'pendente';
      }
      break;
    }
  }

  salvarNoLocalStorage();
  listarTarefas();
}

// =============================================================
// LIMPAR FORMULARIO
// =============================================================

function limparFormulario() {
  document.querySelector('#titulo').value = '';
  document.querySelector('#descricao').value = '';
  document.querySelector('#dataCriacao').value = obterDataHoje();
  document.querySelector('#prioridade').value = 'media';
  document.querySelector('#status').value = 'pendente';

  // Remove marcacoes de erro
  document.querySelector('#titulo').classList.remove('invalido');
  document.querySelector('#descricao').classList.remove('invalido');
  document.querySelector('#erro-titulo').classList.remove('visivel');
  document.querySelector('#erro-descricao').classList.remove('visivel');

  // Sai do modo de edicao
  modoEdicao = false;
  idEmEdicao = null;
  document.querySelector('#btnCadastrar').textContent = 'Cadastrar';
  document.querySelector('#titulo-formulario').textContent = 'Nova Tarefa';
}

// =============================================================
// FILTROS - botoes da nav
// =============================================================

function aplicarFiltro(filtro) {
  filtroAtivo = filtro;

  // Atualiza o estilo dos botoes de filtro
  var botoes = document.querySelectorAll('.btn-filtro');
  for (var i = 0; i < botoes.length; i++) {
    if (botoes[i].dataset.filtro === filtro) {
      botoes[i].classList.add('ativo');
    } else {
      botoes[i].classList.remove('ativo');
    }
  }

  listarTarefas();
}

// =============================================================
// UTILITARIO - retorna a data de hoje no formato YYYY-MM-DD
// =============================================================

function obterDataHoje() {
  var hoje = new Date();
  var ano = hoje.getFullYear();
  var mes = String(hoje.getMonth() + 1).padStart(2, '0');
  var dia = String(hoje.getDate()).padStart(2, '0');
  return ano + '-' + mes + '-' + dia;
}

// =============================================================
// EVENTOS - registra todos os listeners da pagina
// =============================================================

// Submit do formulario
document.querySelector('#formularioTarefa').addEventListener('submit', function(e) {
  e.preventDefault();

  if (modoEdicao) {
    salvarEdicao(idEmEdicao);
  } else {
    cadastrarTarefa();
  }
});

// Botao limpar
document.querySelector('#btnLimpar').addEventListener('click', function() {
  limparFormulario();
});

// Campo de busca em tempo real
document.querySelector('#campoBusca').addEventListener('input', function() {
  buscarTarefa();
});

// Botoes de filtro
var botoesFiltro = document.querySelectorAll('.btn-filtro');
for (var i = 0; i < botoesFiltro.length; i++) {
  botoesFiltro[i].addEventListener('click', function() {
    aplicarFiltro(this.dataset.filtro);
  });
}

// Remove erro do titulo ao digitar
document.querySelector('#titulo').addEventListener('input', function() {
  if (this.value.trim() !== '') {
    this.classList.remove('invalido');
    document.querySelector('#erro-titulo').classList.remove('visivel');
  }
});

// Remove erro da descricao ao digitar
document.querySelector('#descricao').addEventListener('input', function() {
  if (this.value.trim() !== '') {
    this.classList.remove('invalido');
    document.querySelector('#erro-descricao').classList.remove('visivel');
  }
});

// =============================================================
// INICIALIZACAO - executado ao carregar a pagina
// =============================================================

window.onload = function() {
  // Preenche a data com o dia atual
  document.querySelector('#dataCriacao').value = obterDataHoje();

  // Carrega as tarefas salvas no localStorage
  carregarDoLocalStorage();

  // Exibe as tarefas na tela
  listarTarefas();
};
