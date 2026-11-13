// ---------- DADOS DOS PRODUTOS ----------
const produtos = [
  { id: 1, nome: "Pizza de Calabresa", preco: 47.9, descricao: "8 Fatias", categoria: "tradicionais", imagem: "img/calabresa.jpg", destaque: true },
  { id: 2, nome: "Pizza de Margherita", preco: 47.9, descricao: "8 Fatias", categoria: "tradicionais", imagem: "img/margherita.jpg", destaque: true },
  { id: 3, nome: "Pizza de 4 Queijos", preco: 47.9, descricao: "8 Fatias", categoria: "especiais", imagem: "img/4queijos.jpg", destaque: true },
  { id: 4, nome: "Pizza de Portuguesa", preco: 47.9, descricao: "8 Fatias", categoria: "tradicionais", imagem: "img/portuguesa.jpg", destaque: true },
  { id: 5, nome: "Pizza de Frango com Catupiry", preco: 47.9, descricao: "8 Fatias", categoria: "especiais", imagem: "img/frango-catupiry.jpg", destaque: false },
  { id: 6, nome: "Pizza de Milho com Bacon", preco: 47.9, descricao: "8 Fatias", categoria: "especiais", imagem: "img/milho-beacon.jpg", destaque: false },
  { id: 7, nome: "Calzone de Presunto e Queijo", preco: 39.9, descricao: "1 Unidade", categoria: "calzones", imagem: "img/calzone-presunto.jpg", destaque: false },
  { id: 8, nome: "Calzone de Frango", preco: 39.9, descricao: "1 Unidade", categoria: "calzones", imagem: "img/calzone-frango.jpg", destaque: false },
  { id: 9, nome: "Pizza Vegana de Legumes", preco: 44.9, descricao: "8 Fatias", categoria: "veganas", imagem: "img/vegana.jpg", destaque: false },
  { id: 10, nome: "Guaraná 1L", preco: 9.9, descricao: "1 Litro", categoria: "bebidas", imagem: "img/guarana.jpg", destaque: false },
  { id: 11, nome: "Coca Cola 1L", preco: 9.9, descricao: "1 Litro", categoria: "bebidas", imagem: "img/coca-cola.jpg", destaque: false }
];

const TAXA_ENTREGA = 10;

//FUNCOES AUXILIARES
function $(id) {
  return document.getElementById(id);
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function lerStorage(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch (e) {
    return padrao;
  }
}

function salvarStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function buscarProduto(id) {
  return produtos.find(function (p) { return p.id === id; });
}

// tira acentos e deixa minusculo (para a busca)
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function mostrarAviso(mensagem) {
  const aviso = document.createElement("div");
  aviso.className = "toast";
  aviso.textContent = mensagem;
  document.body.appendChild(aviso);
  setTimeout(function () { aviso.remove(); }, 2000);
}

//USUARIO 
function usuarioLogado() {
  const email = localStorage.getItem("usuarioLogado");
  if (!email) return null;
  const usuarios = lerStorage("usuarios", []);
  return usuarios.find(function (u) { return u.email === email; }) || null;
}

function sair() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

function atualizarAreaUsuario() {
  const area = $("area-usuario");
  if (!area) return;
  const usuario = usuarioLogado();
  if (usuario) {
    const primeiroNome = usuario.nome.split(" ")[0];
    area.innerHTML = '<a href="perfil.html">Olá, ' + primeiroNome + '</a>' +
      '<button class="btn-sair" id="btn-sair">Sair</button>';
    $("btn-sair").addEventListener("click", sair);
  }
}

//TEMA CLARO / ESCURO
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("tema", tema);
  const botao = $("btn-tema");
  if (botao) {
    botao.textContent = tema === "dark" ? "Modo Claro" : "Modo Escuro";
  }
}

function iniciarTema() {
  aplicarTema(localStorage.getItem("tema") || "dark");
  const botao = $("btn-tema");
  if (botao) {
    botao.addEventListener("click", function () {
      const atual = document.documentElement.getAttribute("data-theme");
      aplicarTema(atual === "dark" ? "light" : "dark");
    });
  }
}

//MENU (CELULAR)
function iniciarMenu() {
  const botao = $("menu-toggle");
  const menu = $("menu");
  if (!botao || !menu) return;
  botao.addEventListener("click", function () {
    menu.classList.toggle("aberto");
  });

  // marca o link da pagina atual
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  menu.querySelectorAll("a[data-pagina]").forEach(function (link) {
    if (link.getAttribute("data-pagina") === paginaAtual) {
      link.classList.add("ativo");
    }
  });
}

//BUSCA
function iniciarBusca() {
  const form = $("form-busca");
  const campo = $("campo-busca");
  if (!form || !campo) return;

  const naPaginaProdutos = !!$("lista-produtos");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const termo = campo.value.trim();
    if (naPaginaProdutos) {
      termoBusca = termo;
      mostrarProdutos();
    } else {
      window.location.href = "produtos.html?busca=" + encodeURIComponent(termo);
    }
  });

  // na pagina de produtos, filtra enquanto digita
  if (naPaginaProdutos) {
    campo.addEventListener("input", function () {
      termoBusca = campo.value.trim();
      mostrarProdutos();
    });
  }
}

//CARRINHO
function lerCarrinho() {
  return lerStorage("carrinho", []);
}

function atualizarContador() {
  const contador = $("contador-carrinho");
  if (!contador) return;
  let total = 0;
  lerCarrinho().forEach(function (item) { total += item.qtd; });
  contador.textContent = total;
}

function adicionarAoCarrinho(id) {
  const carrinho = lerCarrinho();
  const item = carrinho.find(function (i) { return i.id === id; });
  if (item) {
    item.qtd++;
  } else {
    carrinho.push({ id: id, qtd: 1 });
  }
  salvarStorage("carrinho", carrinho);
  atualizarContador();
  mostrarAviso("Adicionado ao carrinho!");
}

// botoes "Adicionar" (funciona em todas as paginas)
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-add")) {
    adicionarAoCarrinho(Number(e.target.getAttribute("data-id")));
  }
});

//CARDS DE PRODUTO
function criarCard(p) {
  return '<div class="card-produto">' +
    '<img src="' + p.imagem + '" alt="' + p.nome + '" onerror="this.onerror=null;this.src=\'img/placeholder.svg\'">' +
    '<h3>' + p.nome + '</h3>' +
    '<p>' + p.descricao + '</p>' +
    '<p class="preco">' + formatarPreco(p.preco) + '</p>' +
    '<button class="btn btn-add" data-id="' + p.id + '">Adicionar</button>' +
    '</div>';
}

//PAGINA INICIAL
function mostrarDestaques() {
  const lista = $("lista-destaques");
  if (!lista) return;
  let html = "";
  produtos.filter(function (p) { return p.destaque; }).forEach(function (p) {
    html += criarCard(p);
  });
  lista.innerHTML = html;
}

//PAGINA DE PRODUTOS
let categoriaAtual = "todas";
let termoBusca = "";

function mostrarProdutos() {
  const lista = $("lista-produtos");
  if (!lista) return;

  const filtrados = produtos.filter(function (p) {
    const categoriaOk = categoriaAtual === "todas" || p.categoria === categoriaAtual;
    const buscaOk = normalizar(p.nome).includes(normalizar(termoBusca));
    return categoriaOk && buscaOk;
  });

  if (filtrados.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhum produto encontrado. Tente buscar por outro nome.</p>';
    return;
  }

  let html = "";
  filtrados.forEach(function (p) { html += criarCard(p); });
  lista.innerHTML = html;
}

function iniciarProdutos() {
  if (!$("lista-produtos")) return;

  // le o termo da URL (vindo da busca de outra pagina)
  const params = new URLSearchParams(window.location.search);
  termoBusca = params.get("busca") || "";
  if ($("campo-busca")) $("campo-busca").value = termoBusca;

  document.querySelectorAll(".filtros button").forEach(function (botao) {
    botao.addEventListener("click", function () {
      document.querySelectorAll(".filtros button").forEach(function (b) { b.classList.remove("ativo"); });
      botao.classList.add("ativo");
      categoriaAtual = botao.getAttribute("data-categoria");
      mostrarProdutos();
    });
  });

  mostrarProdutos();
}

//PAGINA DO CARRINHO 
function mostrarCarrinho() {
  const lista = $("lista-carrinho");
  if (!lista) return;

  const carrinho = lerCarrinho();
  let subtotal = 0;
  let html = "";

  if (carrinho.length === 0) {
    html = '<p class="vazio">Seu carrinho está vazio. <a href="produtos.html" style="text-decoration:underline">Ver produtos</a></p>';
  }

  carrinho.forEach(function (item) {
    const p = buscarProduto(item.id);
    if (!p) return;
    subtotal += p.preco * item.qtd;
    html += '<div class="item-carrinho">' +
      '<img src="' + p.imagem + '" alt="' + p.nome + '" onerror="this.onerror=null;this.src=\'img/placeholder.svg\'">' +
      '<div class="info"><h3>' + p.nome + '</h3><p>-</p><p>' + formatarPreco(p.preco) + '</p></div>' +
      '<div class="quantidade">' +
      '<button data-acao="menos" data-id="' + p.id + '">-</button>' +
      '<span>' + item.qtd + '</span>' +
      '<button data-acao="mais" data-id="' + p.id + '">+</button>' +
      '</div>' +
      '<button class="btn-lixo" data-acao="remover" data-id="' + p.id + '" aria-label="Remover item"><span class="icone-lixeira"></span></button>' +
      '</div>';
  });

  lista.innerHTML = html;

  const entrega = carrinho.length > 0 ? TAXA_ENTREGA : 0;
  $("subtotal").textContent = formatarPreco(subtotal);
  $("entrega").textContent = formatarPreco(entrega);
  $("total").textContent = formatarPreco(subtotal + entrega);
}

function iniciarCarrinho() {
  const lista = $("lista-carrinho");
  if (!lista) return;

  lista.addEventListener("click", function (e) {
    const acao = e.target.getAttribute("data-acao");
    if (!acao) return;
    const id = Number(e.target.getAttribute("data-id"));
    let carrinho = lerCarrinho();
    const item = carrinho.find(function (i) { return i.id === id; });

    if (acao === "mais") item.qtd++;
    if (acao === "menos" && item.qtd > 1) item.qtd--;
    if (acao === "remover") {
      carrinho = carrinho.filter(function (i) { return i.id !== id; });
    }

    salvarStorage("carrinho", carrinho);
    atualizarContador();
    mostrarCarrinho();
  });

  $("btn-finalizar").addEventListener("click", finalizarPedido);
  mostrarCarrinho();
}

function finalizarPedido() {
  const carrinho = lerCarrinho();
  if (carrinho.length === 0) {
    mostrarAviso("Seu carrinho está vazio!");
    return;
  }

  const usuario = usuarioLogado();
  if (!usuario) {
    alert("Faça login para finalizar o pedido.");
    window.location.href = "login.html";
    return;
  }

  let total = TAXA_ENTREGA;
  const itens = carrinho.map(function (item) {
    const p = buscarProduto(item.id);
    total += p.preco * item.qtd;
    return { nome: p.nome, qtd: item.qtd, preco: p.preco, imagem: p.imagem, categoria: p.categoria };
  });

  const chave = "pedidos_" + usuario.email;
  const pedidos = lerStorage(chave, []);
  pedidos.unshift({
    id: Date.now(),
    data: new Date().toLocaleString("pt-BR"),
    itens: itens,
    total: total,
    status: "Preparando"
  });
  salvarStorage(chave, pedidos);
  salvarStorage("carrinho", []);
  window.location.href = "pedidos.html";
}

//PAGINA DE PEDIDOS
function mostrarPedidos() {
  const lista = $("lista-pedidos");
  if (!lista) return;

  const usuario = usuarioLogado();
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  const chave = "pedidos_" + usuario.email;
  const pedidos = lerStorage(chave, []);

  if (pedidos.length === 0) {
    lista.innerHTML = '<p class="vazio">Você ainda não fez pedidos. <a href="produtos.html" style="text-decoration:underline">Ver produtos</a></p>';
    return;
  }

  let html = "";
  pedidos.forEach(function (pedido) {
    // o primeiro item vira o titulo, os outros aparecem como "+ item"
    const principal = pedido.itens[0];
    let extras = "";
    pedido.itens.slice(1).forEach(function (i) {
      extras += '<p class="extra">+ ' + (i.qtd > 1 ? i.qtd + "x " : "") + i.nome + '</p>';
    });

    let classe = "preparando";
    if (pedido.status === "Saiu para a Entrega") classe = "entrega";
    if (pedido.status === "Cancelado") classe = "cancelado";

    let botaoCancelar = "";
    if (pedido.status === "Preparando") {
      botaoCancelar = '<button class="btn-cancelar" data-id="' + pedido.id + '">Cancelar pedido</button>';
    }

    html += '<div class="item-pedido">' +
      '<img src="' + principal.imagem + '" alt="' + principal.nome + '" onerror="this.onerror=null;this.src=\'img/placeholder.svg\'">' +
      '<div>' +
      '<h3>' + (principal.qtd > 1 ? principal.qtd + "x " : "") + principal.nome + ' - ' + formatarPreco(pedido.total) + '</h3>' +
      extras +
      '<p class="status ' + classe + '">' + pedido.status + '</p>' +
      '<p class="data">Pedido em ' + pedido.data + '</p>' +
      botaoCancelar +
      '</div></div>';
  });
  lista.innerHTML = html;

  lista.onclick = function (e) {
    if (!e.target.classList.contains("btn-cancelar")) return;
    const id = Number(e.target.getAttribute("data-id"));
    const pedido = pedidos.find(function (p) { return p.id === id; });
    pedido.status = "Cancelado";
    salvarStorage(chave, pedidos);
    mostrarPedidos();
  };
}

//MASCARAS DOS CAMPOS
function soNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function mascaraCPF(valor) {
  valor = soNumeros(valor).slice(0, 11);
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return valor;
}

function mascaraTelefone(valor) {
  valor = soNumeros(valor).slice(0, 11);
  valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
  valor = valor.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  return valor;
}

function mascaraCEP(valor) {
  valor = soNumeros(valor).slice(0, 8);
  valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
  return valor;
}

function soLetras(valor) {
  return valor.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
}

function iniciarMascaras() {
  document.querySelectorAll("[data-mascara]").forEach(function (campo) {
    campo.addEventListener("input", function () {
      const tipo = campo.getAttribute("data-mascara");
      if (tipo === "cpf") campo.value = mascaraCPF(campo.value);
      if (tipo === "telefone") campo.value = mascaraTelefone(campo.value);
      if (tipo === "cep") campo.value = mascaraCEP(campo.value);
      if (tipo === "numero") campo.value = soNumeros(campo.value);
      if (tipo === "letras") campo.value = soLetras(campo.value);
    });
  });
}

function cpfValido(cpf) {
  cpf = soNumeros(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) {
      soma += Number(cpf[i]) * (t + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(cpf[t])) return false;
  }
  return true;
}

//LOGIN E CADASTRO
function mostrarAba(nome) {
  $("form-login").classList.toggle("oculto", nome !== "login");
  $("form-cadastro").classList.toggle("oculto", nome !== "cadastro");
  $("aba-login").classList.toggle("ativo", nome === "login");
  $("aba-cadastro").classList.toggle("ativo", nome === "cadastro");
  window.location.hash = nome === "cadastro" ? "cadastro" : "";
}

function iniciarLogin() {
  const formLogin = $("form-login");
  const formCadastro = $("form-cadastro");
  if (!formLogin || !formCadastro) return;

  $("aba-login").addEventListener("click", function () { mostrarAba("login"); });
  $("aba-cadastro").addEventListener("click", function () { mostrarAba("cadastro"); });
  $("btn-criar-conta").addEventListener("click", function () { mostrarAba("cadastro"); });

  document.querySelectorAll(".btn-social").forEach(function (b) {
    b.addEventListener("click", function () {
      alert("Login social ainda não disponível. Use e-mail e senha.");
    });
  });

  if (window.location.hash === "#cadastro") mostrarAba("cadastro");

  //login
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = formLogin.elements.email.value.trim().toLowerCase();
    const senha = formLogin.elements.senha.value;
    const usuarios = lerStorage("usuarios", []);
    const usuario = usuarios.find(function (u) { return u.email === email && u.senha === senha; });

    if (!usuario) {
      $("erro-login").textContent = "E-mail ou senha incorretos.";
      return;
    }
    localStorage.setItem("usuarioLogado", usuario.email);
    window.location.href = "index.html";
  });

  //cadastro
  formCadastro.addEventListener("submit", function (e) {
    e.preventDefault();
    const f = formCadastro.elements;
    let ok = true;

    //limpa erros antigos
    formCadastro.querySelectorAll(".erro").forEach(function (s) { s.textContent = ""; });
    formCadastro.querySelectorAll("input").forEach(function (i) { i.classList.remove("invalido"); });

    function erro(campo, mensagem) {
      campo.closest(".campo").querySelector(".erro").textContent = mensagem;
      campo.classList.add("invalido");
      ok = false;
    }

    const usuarios = lerStorage("usuarios", []);
    const email = f.email.value.trim().toLowerCase();

    if (f.nome.value.trim().split(" ").length < 2 || f.nome.value.trim().length < 5) erro(f.nome, "Digite seu nome completo.");
    if (!cpfValido(f.cpf.value)) erro(f.cpf, "CPF inválido.");
    if (soNumeros(f.telefone.value).length < 10) erro(f.telefone, "Digite o telefone com DDD.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erro(f.email, "Digite um e-mail válido.");
    else if (usuarios.some(function (u) { return u.email === email; })) erro(f.email, "Este e-mail já está cadastrado.");
    if (soNumeros(f.cep.value).length !== 8) erro(f.cep, "CEP deve ter 8 números.");
    if (f.rua.value.trim() === "") erro(f.rua, "Digite a rua.");
    if (f.numero.value === "") erro(f.numero, "Digite o número.");
    if (f.bairro.value.trim() === "") erro(f.bairro, "Digite o bairro.");
    if (f.senha.value.length < 6) erro(f.senha, "A senha deve ter pelo menos 6 caracteres.");
    if (f.confirmar.value !== f.senha.value) erro(f.confirmar, "As senhas não são iguais.");

    if (!ok) return;

    // OBS: guardar senha em texto puro so serve para estudo!
    usuarios.push({
      nome: f.nome.value.trim(),
      cpf: f.cpf.value,
      telefone: f.telefone.value,
      email: email,
      cep: f.cep.value,
      rua: f.rua.value.trim(),
      numero: f.numero.value,
      bairro: f.bairro.value.trim(),
      senha: f.senha.value
    });
    salvarStorage("usuarios", usuarios);
    localStorage.setItem("usuarioLogado", email);
    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  });
}

//PAGINA DE PERFIL
function mostrarPerfil() {
  if (!$("perfil-nome")) return;

  const usuario = usuarioLogado();
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  $("perfil-nome").textContent = usuario.nome;
  $("perfil-email").textContent = usuario.email;
  $("dado-nome").textContent = usuario.nome;
  $("dado-telefone").textContent = usuario.telefone;
  $("dado-email").textContent = usuario.email;
  $("dado-endereco").textContent = usuario.rua + ", " + usuario.numero + " - " + usuario.bairro;
  $("dado-cpf").textContent = usuario.cpf;

  const notificacoes = $("switch-notificacoes");
  notificacoes.checked = localStorage.getItem("notificacoes") !== "nao";
  notificacoes.addEventListener("change", function () {
    localStorage.setItem("notificacoes", notificacoes.checked ? "sim" : "nao");
    mostrarAviso(notificacoes.checked ? "Notificações ativadas" : "Notificações desativadas");
  });

  $("btn-pagamento").addEventListener("click", function () {
    alert("Edição da forma de pagamento em breve.");
  });
  $("btn-sair-perfil").addEventListener("click", sair);
}

//INICIO
document.addEventListener("DOMContentLoaded", function () {
  iniciarTema();
  iniciarMenu();
  iniciarBusca();
  atualizarAreaUsuario();
  atualizarContador();
  iniciarMascaras();
  mostrarDestaques();
  iniciarProdutos();
  iniciarCarrinho();
  mostrarPedidos();
  iniciarLogin();
  mostrarPerfil();
});
