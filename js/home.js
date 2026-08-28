const perguntaEl = document.getElementById('pergunta');
const respostaEl = document.getElementById('resposta');
const enviarBtn = document.getElementById('enviar-btn');
const avisoEl = document.getElementById('aviso');
const bodyEl = document.getElementById('body');
const musicaEl = document.getElementById('musica');

let avisoTexto = 'Resposta enviada com sucesso!';

async function carregarConfig() {
  const { data, error } = await supabaseClient
    .from('config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    perguntaEl.textContent = 'Erro ao carregar a pergunta.';
    return;
  }

  perguntaEl.textContent = data.pergunta;
  avisoTexto = data.aviso;

  if (data.wallpaper_url) {
    bodyEl.style.backgroundImage = `url('${data.wallpaper_url}')`;
  }

  if (data.musica_url) {
    musicaEl.src = data.musica_url;
    // navegadores bloqueiam autoplay com som sem interação do usuário,
    // então tentamos tocar e, se falhar, tocamos no primeiro clique.
    musicaEl.play().catch(() => {
      document.body.addEventListener('click', () => musicaEl.play(), { once: true });
    });
  }
}

enviarBtn.addEventListener('click', async () => {
  const texto = respostaEl.value.trim();
  if (!texto) return;

  enviarBtn.disabled = true;
  enviarBtn.textContent = 'Enviando...';

  const { error } = await supabaseClient
    .from('respostas')
    .insert({ texto });

  enviarBtn.disabled = false;
  enviarBtn.textContent = 'Enviar';

  if (error) {
    avisoEl.textContent = 'Erro ao enviar. Tente novamente.';
    avisoEl.style.display = 'block';
    return;
  }

  respostaEl.value = '';
  avisoEl.textContent = avisoTexto;
  avisoEl.style.display = 'block';
});

carregarConfig();
