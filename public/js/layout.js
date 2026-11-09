// public/js/layout.js - Controle Estrito de Acesso por Perfil (RBAC) e Menu Dinâmico (Co.Nexo SENAC)

document.addEventListener('DOMContentLoaded', () => {
  aplicarControleDeAcessoRBAC();
  configurarResponsividadeGlobal();
});

function toggleMobileSidebar(forcarEstado) {
  const aside = document.querySelector('aside');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');
  if (!aside) return;

  const estaAberto = !aside.classList.contains('-translate-x-full');
  const abrir = typeof forcarEstado === 'boolean' ? forcarEstado : !estaAberto;

  if (abrir) {
    aside.classList.remove('-translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
  } else {
    aside.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }
}

function configurarResponsividadeGlobal() {
  const aside = document.querySelector('aside');
  const header = document.querySelector('header');
  if (!aside || !header) return;

  // 1. Garante min-w-0 e remove margem fixa mobile (ml-64) no container principal ao lado da sidebar
  const mainWrapper = aside.nextElementSibling;
  if (mainWrapper) {
    mainWrapper.classList.remove('ml-64');
    mainWrapper.classList.add('min-w-0', 'w-full');
  }

  // 2. Transforma a sidebar fixa em um Drawer responsivo em celulares/tablets (< 1024px) e fixa no desktop (lg+)
  aside.classList.remove('sticky');
  aside.classList.add(
    'fixed',
    'inset-y-0',
    'left-0',
    'z-50',
    '-translate-x-full',
    'lg:translate-x-0',
    'lg:sticky',
    'transition-transform',
    'duration-300',
    'ease-in-out',
    'shadow-2xl',
    'lg:shadow-none'
  );

  // 3. Cria o backdrop escuro para fechar o menu ao tocar fora no celular/tablet
  if (!document.getElementById('mobile-sidebar-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'mobile-sidebar-backdrop';
    backdrop.className = 'fixed inset-0 bg-black/50 backdrop-blur-[1px] z-40 hidden lg:hidden print:hidden transition-opacity';
    backdrop.onclick = () => toggleMobileSidebar(false);
    document.body.appendChild(backdrop);
  }

  // 4. Injeta botão de fechar (X) dentro do topo da Sidebar para telas menores que lg
  const topoAside = aside.querySelector('div > div:first-child > div:first-child');
  if (topoAside && !document.getElementById('btn-fechar-sidebar-mobile')) {
    topoAside.classList.add('justify-between');
    const btnFechar = document.createElement('button');
    btnFechar.id = 'btn-fechar-sidebar-mobile';
    btnFechar.type = 'button';
    btnFechar.className = 'lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors';
    btnFechar.innerHTML = '<span class="material-symbols-outlined text-xl">close</span>';
    btnFechar.onclick = () => toggleMobileSidebar(false);
    topoAside.appendChild(btnFechar);
  }

  // 5. Injeta o botão Hambúrguer no início do Header superior para abrir o menu em celulares e tablets (< 1024px)
  const containerEsquerdoHeader = header.querySelector('div:first-child');
  if (containerEsquerdoHeader && !document.getElementById('btn-abrir-sidebar-mobile')) {
    const btnMenu = document.createElement('button');
    btnMenu.id = 'btn-abrir-sidebar-mobile';
    btnMenu.type = 'button';
    btnMenu.title = 'Abrir menu de navegação';
    btnMenu.className = 'lg:hidden p-1.5 -ml-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary-container hover:bg-surface-container transition-colors flex items-center justify-center shrink-0';
    btnMenu.innerHTML = '<span class="material-symbols-outlined text-xl">menu</span>';
    btnMenu.onclick = () => toggleMobileSidebar(true);
    containerEsquerdoHeader.insertBefore(btnMenu, containerEsquerdoHeader.firstChild);
  }
}

function aplicarControleDeAcessoRBAC() {
  const path = window.location.pathname;
  const paginaAtual = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  // Não aplica guarda administrativa no login ou no portal externo do aluno
  if (paginaAtual === 'login.html' || paginaAtual === 'agendar.html') return;

  const user = getCurrentUser();
  if (!user || !user.role) {
    window.location.href = 'login.html';
    return;
  }

  const role = user.role;
  const perfilInfo = PERFIS_SENAC[role] || PERFIS_SENAC.coordenador;

  // 1. Guarda de Rota: Impede que um perfil acesse páginas de outro perfil
  if (!perfilInfo.paginasPermitidas.includes(paginaAtual)) {
    window.location.href = perfilInfo.homeUrl;
    return;
  }

  // 2. Renderiza na Sidebar APENAS os links permitidos para aquele usuário, com rótulos específicos da rotina real
  const nav = document.querySelector('aside nav');
  if (nav) {
    let menusPorPerfil = [];
    if (role === 'coordenador') {
      menusPorPerfil = [
        { href: 'index.html', icon: 'monitoring', label: 'Indicadores & Funil' },
        { href: 'alunos.html', icon: 'groups', label: 'Base Geral de Alunos' }
      ];
    } else if (role === 'atendimento') {
      menusPorPerfil = [
        { href: 'alunos.html', icon: 'filter_alt', label: '1. Leads RD & Diagnóstico' },
        { href: 'agenda.html', icon: 'calendar_month', label: '2. Grade dos Professores' }
      ];
    } else if (role === 'consultor') {
      menusPorPerfil = [
        { href: 'alunos.html', icon: 'school', label: 'Meus Mentorados' }
      ];
    }

    let htmlNav = menusPorPerfil
      .map(item => {
        const ativo = paginaAtual === item.href;
        const classes = ativo
          ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all'
          : 'flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface text-sm font-medium transition-colors';
        return `
          <a class="${classes}" href="${item.href}">
            <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `;
      }).join('');

    // Se estiver na Ficha 360 (exclusivo Aline), destaca o item na navegação
    if (paginaAtual === 'ficha.html' && role === 'consultor') {
      htmlNav += `
        <a class="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all" href="#">
          <span class="material-symbols-outlined text-[20px]">menu_book</span>
          <span>Diário de Mentoria</span>
        </a>
      `;
    }

    nav.innerHTML = htmlNav;
  }

  // 3. Oculta o botão de ação rápida do topo da Sidebar se não pertencer ao perfil
  // (Ex: "Novo Atendimento" / "+ Cadastrar Empreendedor" só faz sentido para Max; "Gerar Bloco de 4h" só para Max)
  const btnTopoSidebar = document.querySelector('aside button, aside div.px-1 a');
  if (btnTopoSidebar && paginaAtual !== 'ficha.html') {
    if (role !== 'atendimento') {
      btnTopoSidebar.classList.add('hidden');
    }
  }

  // 4. Card de Usuário Logado no Rodapé da Sidebar (Sem botões de alternar perfil!)
  const sidebarProfile = document.getElementById('sidebar-user-profile');
  if (sidebarProfile) {
    sidebarProfile.innerHTML = `
      <div class="p-3 rounded-xl bg-surface-container border border-outline-variant/80 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-9 h-9 rounded-xl ${perfilInfo.corBadge} flex items-center justify-center font-headline font-bold text-xs shrink-0 shadow-sm">
            ${perfilInfo.sigla}
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-xs font-bold text-on-surface truncate">${user.nome || perfilInfo.nome}</span>
            <span class="text-[10px] text-on-surface-variant truncate">${perfilInfo.cargo}</span>
          </div>
        </div>
        <button onclick="logout()" title="Sair da conta" class="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0">
          <span class="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    `;
  }

  // 5. Oculta ou exibe elementos específicos dentro da mesma página conforme data-role-only
  document.querySelectorAll('[data-role-only]').forEach(el => {
    const allowed = el.getAttribute('data-role-only').split(',').map(s => s.trim());
    if (!allowed.includes(role)) {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }
  });
}
