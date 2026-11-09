// public/js/api.js - Core Corporativo de API, Autenticação RBAC, WhatsApp e Exportação (Co.Nexo SENAC)
const API_BASE = '/api';

// Perfis Homologados do Ecossistema Co.Nexo SENAC (Rotas e Permissões Estritas por Cargo)
const PERFIS_SENAC = {
  coordenador: {
    id: 'perfil-regis',
    nome: 'Regis (Coordenação)',
    cargo: 'Coordenação & Indicadores',
    sigla: 'RG',
    email: 'regis.coordenacao@senac.br',
    senhaPadrao: 'senha123456',
    role: 'coordenador',
    corBadge: 'bg-primary-container text-white',
    homeUrl: 'index.html',
    paginasPermitidas: ['index.html', 'alunos.html']
  },
  atendimento: {
    id: 'perfil-max',
    nome: 'Max (Atendimento)',
    cargo: 'Captação RD, Triagem & Agendamento',
    sigla: 'MX',
    email: 'max.atendimento@senac.br',
    senhaPadrao: 'senha123456',
    role: 'atendimento',
    corBadge: 'bg-secondary-container text-white',
    homeUrl: 'alunos.html',
    paginasPermitidas: ['alunos.html', 'agenda.html']
  },
  consultor: {
    id: 'perfil-aline',
    nome: 'Aline (Professora)',
    cargo: 'Mentoria & Diário de Evolução',
    sigla: 'AL',
    email: 'aline.consultoria@senac.br',
    senhaPadrao: 'senha123456',
    role: 'consultor',
    corBadge: 'bg-emerald-700 text-white',
    homeUrl: 'alunos.html',
    paginasPermitidas: ['alunos.html', 'ficha.html']
  }
};

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('conexo_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function setSession(token, usuario) {
  if (token) localStorage.setItem('conexo_token', token);
  if (usuario) localStorage.setItem('conexo_user', JSON.stringify(usuario));
}

function logout() {
  localStorage.removeItem('conexo_token');
  localStorage.removeItem('conexo_user');
  window.location.href = 'login.html';
}

async function loginComPerfil(roleKey, redirecionarParaHome = false) {
  const perfil = PERFIS_SENAC[roleKey] || PERFIS_SENAC.coordenador;
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: perfil.email, senha: perfil.senhaPadrao })
    });
    const data = await response.json();
    if (response.ok && data.sucesso) {
      setSession(data.token, {
        ...perfil,
        id: data.usuario.id,
        nome: data.usuario.nome,
        email: data.usuario.email,
        role: data.usuario.role
      });
    } else {
      setSession(null, perfil);
    }
  } catch (err) {
    setSession(null, perfil);
  }

  if (redirecionarParaHome) {
    window.location.href = perfil.homeUrl;
  } else {
    window.location.reload();
  }
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const currentUser = getCurrentUser();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('conexo_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const isPortalExterno = window.location.pathname.endsWith('agendar.html');
  if (!isPortalExterno && currentUser && currentUser.role) {
    headers['x-mock-role'] = currentUser.role;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.erro || data.detalhes?.map(d => d.mensagem).join(', ') || 'Erro ao processar requisição';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    showToast(error.message, 'danger');
    throw error;
  }
}

function showToast(message, type = 'primary') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-[100] flex flex-col gap-2 sm:max-w-sm pointer-events-none print:hidden';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'danger'
    ? 'bg-red-600 text-white'
    : (type === 'success' ? 'bg-emerald-600 text-white' : 'bg-[#004587] text-white');
  const icon = type === 'danger' ? 'error' : (type === 'success' ? 'check_circle' : 'info');

  toast.className = `${bgClass} px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0`;
  toast.innerHTML = `
    <div class="flex items-center gap-2.5">
      <span class="material-symbols-outlined text-base">${icon}</span>
      <span class="leading-snug">${message}</span>
    </div>
    <button class="ml-3 text-white/80 hover:text-white focus:outline-none" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatOnlyDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatCPF(cpf) {
  if (!cpf) return '-';
  const c = String(cpf).replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCNPJ(cnpj) {
  if (!cnpj) return '-';
  const c = String(cnpj).replace(/\D/g, '');
  if (c.length !== 14) return cnpj;
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatPhone(phone) {
  if (!phone) return '-';
  const p = String(phone).replace(/\D/g, '');
  if (p.length === 11) {
    return p.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (p.length === 10) {
    return p.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// Gerador de Link Oficial WhatsApp Click-to-Chat com Template Institucional SENAC
function gerarLinkWhatsApp(telefone, mensagem) {
  const limpo = String(telefone || '').replace(/\D/g, '');
  const ddi = limpo.startsWith('55') ? limpo : `55${limpo}`;
  return `https://wa.me/${ddi}?text=${encodeURIComponent(mensagem)}`;
}

// Exportador Corporativo para Excel (CSV UTF-8 com BOM)
function exportarParaCSV(nomeArquivo, cabecalhos, linhas) {
  const separador = ';';
  const escapar = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${str}"`;
  };

  const conteudo = [
    cabecalhos.map(escapar).join(separador),
    ...linhas.map(linha => linha.map(escapar).join(separador))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Relatório "${nomeArquivo}" exportado com sucesso!`, 'success');
}
