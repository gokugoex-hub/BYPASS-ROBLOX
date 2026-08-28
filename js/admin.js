const loginBox = document.getElementById('login-box');
const painel = document.getElementById('painel');
const loginMsg = document.getElementById('login-msg');

// ============ LOGIN ============

async function checarSessao() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    mostrarPainel();
  }
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (error) {
    loginMsg.textContent = 'E-mail ou senha inválidos.';
    loginMsg.className = 'msg-erro';
    return;
  }

  mostrarPainel();
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

function mostrarPainel() {
  loginBox.style.display = 'none';
  painel.style.display = 'block';
  carregarRespostas();
  carregarConfigEdit();
  carregarContas();
}

checarSessao();

// ============ ABAS ============

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ============ ABA 1: RESPOSTAS ============

async function carregarRespostas() {
  const lista = document.getElementById('lista-respostas');
  const { data, error } = await supabaseClient
    .from('respostas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    lista.textContent = 'Erro ao carregar respostas.';
    return;
  }

  if (!data.length) {
    lista.textContent = 'Nenhuma resposta recebida ainda.';
    return;
  }

  lista.innerHTML = '';
  data.forEach(r => {
    const div = document.createElement('div');
    div.className = 'resposta-item';
    div.innerHTML = `
      <p>${escapeHtml(r.texto)}</p>
      <p class="subtitle">${new Date(r.created_at).toLocaleString('pt-BR')}</p>
      <div class="acoes">
        <button class="btn-copiar">Copiar</button>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    div.querySelector('.btn-copiar').addEventListener('click', async (e) => {
      try {
        await navigator.clipboard.writeText(r.texto);
        const btn = e.target;
        const textoOriginal = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = textoOriginal; }, 1500);
      } catch (err) {
        alert('Não foi possível copiar.');
      }
    });

    div.querySelector('.btn-excluir').addEventListener('click', async () => {
      if (!confirm('Excluir esta resposta?')) return;
      await supabaseClient.from('respostas').delete().eq('id', r.id);
      carregarRespostas();
    });

    lista.appendChild(div);
  });
}

// ============ ABA 2: EDITAR ============

let configAtual = null;

async function carregarConfigEdit() {
  const { data, error } = await supabaseClient.from('config').select('*').eq('id', 1).single();
  if (error || !data) return;

  configAtual = data;
  document.getElementById('edit-pergunta').value = data.pergunta || '';
  document.getElementById('edit-aviso').value = data.aviso || '';
  document.getElementById('wallpaper-atual').textContent = data.wallpaper_url
    ? 'Wallpaper atual: ' + data.wallpaper_url
    : 'Nenhum wallpaper definido.';
  document.getElementById('musica-atual').textContent = data.musica_url
    ? 'Música atual: ' + data.musica_url
    : 'Nenhuma música definida.';
}

async function uploadArquivo(file, pasta) {
  const nomeArquivo = `${pasta}/${Date.now()}-${file.name}`;
  const { error } = await supabaseClient.storage.from('midia').upload(nomeArquivo, file, {
    upsert: true
  });
  if (error) throw error;

  const { data } = supabaseClient.storage.from('midia').getPublicUrl(nomeArquivo);
  return data.publicUrl;
}

document.getElementById('salvar-config-btn').addEventListener('click', async () => {
  const msg = document.getElementById('editar-msg');
  msg.textContent = 'Salvando...';
  msg.className = '';

  try {
    const novaConfig = {
      pergunta: document.getElementById('edit-pergunta').value.trim(),
      aviso: document.getElementById('edit-aviso').value.trim()
    };

    const wallpaperFile = document.getElementById('edit-wallpaper-file').files[0];
    const musicaFile = document.getElementById('edit-musica-file').files[0];

    if (wallpaperFile) {
      novaConfig.wallpaper_url = await uploadArquivo(wallpaperFile, 'wallpapers');
    }
    if (musicaFile) {
      novaConfig.musica_url = await uploadArquivo(musicaFile, 'musicas');
    }

    const { error } = await supabaseClient.from('config').update(novaConfig).eq('id', 1);
    if (error) throw error;

    msg.textContent = 'Salvo com sucesso!';
    msg.className = 'msg-ok';
    carregarConfigEdit();
  } catch (err) {
    msg.textContent = 'Erro ao salvar: ' + err.message;
    msg.className = 'msg-erro';
  }
});

// ============ ABA 3: CONTAS ============

document.getElementById('add-conta-btn').addEventListener('click', async () => {
  const nick = document.getElementById('conta-nick').value.trim();
  const senha = document.getElementById('conta-senha').value.trim();
  const email = document.getElementById('conta-email').value.trim();
  const observacao = document.getElementById('conta-obs').value.trim();

  if (!nick && !email) {
    alert('Preencha ao menos o nick ou o e-mail.');
    return;
  }

  const { error } = await supabaseClient.from('contas').insert({ nick, senha, email, observacao });
  if (error) {
    alert('Erro ao adicionar conta.');
    return;
  }

  document.getElementById('conta-nick').value = '';
  document.getElementById('conta-senha').value = '';
  document.getElementById('conta-email').value = '';
  document.getElementById('conta-obs').value = '';
  carregarContas();
});

async function carregarContas() {
  const lista = document.getElementById('lista-contas');
  const { data, error } = await supabaseClient
    .from('contas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    lista.textContent = 'Erro ao carregar contas.';
    return;
  }

  if (!data.length) {
    lista.textContent = 'Nenhuma conta cadastrada ainda.';
    return;
  }

  lista.innerHTML = '';
  data.forEach(c => {
    const div = document.createElement('div');
    div.className = 'conta-item';
    div.innerHTML = `
      <p><strong>Nick:</strong> ${escapeHtml(c.nick || '-')}</p>
      <p><strong>Senha:</strong> ${escapeHtml(c.senha || '-')}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(c.email || '-')}</p>
      <p><strong>Observação:</strong> ${escapeHtml(c.observacao || '-')}</p>
      <div class="acoes">
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    div.querySelector('.btn-excluir').addEventListener('click', async () => {
      if (!confirm('Excluir esta conta?')) return;
      await supabaseClient.from('contas').delete().eq('id', c.id);
      carregarContas();
    });

    lista.appendChild(div);
  });
}

// ============ UTIL ============

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}