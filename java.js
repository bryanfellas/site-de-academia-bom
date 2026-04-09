document.addEventListener("DOMContentLoaded", () => {

  const telaHome       = document.getElementById("telaHome");
  const telaEdicao     = document.getElementById("telaEdicao");
  const telaExercicio  = document.getElementById("telaExercicio");
  const listaTreinos   = document.getElementById("listaTreinos");
  const btnNovoTreino  = document.getElementById("btnNovoTreino");
  const btnVoltar         = document.getElementById("btnVoltar");
  const btnApagarTreino   = document.getElementById("btnApagarTreino");
  const nomeTreino        = document.getElementById("nomeTreino");
  const listaExercicios   = document.getElementById("exercicios");
  const addExercicio      = document.getElementById("addExercicio");
  const btnVoltarExercicio   = document.getElementById("btnVoltarExercicio");
  const nomeExercicioTela    = document.getElementById("nomeExercicioTela");
  const badgeExercicioTela   = document.getElementById("badgeExercicioTela");
  const gifExercicio         = document.getElementById("gifExercicio");
  const notasExercicio       = document.getElementById("notasExercicio");
  const valSeries   = document.getElementById("valSeries");
  const valReps     = document.getElementById("valReps");
  const valCarga    = document.getElementById("valCarga");
  const valDescanso = document.getElementById("valDescanso");
  const timerDisplay    = document.getElementById("timerDisplay");
  const timerBarraFill  = document.getElementById("timerBarraFill");
  const btnIniciarTimer = document.getElementById("btnIniciarTimer");
  const btnResetTimer   = document.getElementById("btnResetTimer");
  const overlayBusca = document.getElementById("overlayBusca");
  const inputBusca   = document.getElementById("inputBusca");
  const sugestoes    = document.getElementById("sugestoes");
  const filtroGrupos = document.getElementById("filtroGrupos");
  const filtroTiers  = document.getElementById("filtroTiers");
  const overlayConfirmarTreino    = document.getElementById("overlayConfirmarTreino");
  const btnConfirmarApagarTreino  = document.getElementById("btnConfirmarApagarTreino");
  const btnCancelarApagarTreino   = document.getElementById("btnCancelarApagarTreino");
  const overlayConfirmarExercicio = document.getElementById("overlayConfirmarExercicio");
  const txtConfirmarExercicio     = document.getElementById("txtConfirmarExercicio");
  const btnConfirmarRemoverEx     = document.getElementById("btnConfirmarRemoverEx");
  const btnCancelarRemoverEx      = document.getElementById("btnCancelarRemoverEx");
  const btnDarkMode = document.getElementById("btnDarkMode");

  let treinos              = carregarTreinos();
  let treinoAtualId        = null;
  let exercicioAtualIndex  = null;
  let indexRemoverPendente = null;
  let filtroGrupoAtivo     = null;
  let filtroTierAtivo      = null;
  let timerIntervalo  = null;
  let timerRestante   = 0;
  let timerTotal      = 0;
  let timerRodando    = false;

  const GRUPOS = [
    { label: "Peito",   termos: ["peitoral"] },
    { label: "Costas",  termos: ["latíssimo", "upperback", "teres"] },
    { label: "Ombro",   termos: ["deltoide"] },
    { label: "Bíceps",  termos: ["bíceps"] },
    { label: "Tríceps", termos: ["tríceps"] },
    { label: "Perna",   termos: ["quadríceps", "posterior de coxa", "glúteo", "panturrilha", "adutores"] },
    { label: "Abdômen", termos: ["abdômen", "oblíquos"] },
    { label: "Pescoço", termos: ["pescoço"] },
  ];

  const TIERS = ["S", "A", "B", "C", "D", "F"];

  const LIMITES = {
    series:   { min: 1,  max: 20, passo: 1  },
    reps:     { min: 1,  max: 50, passo: 1  },
    carga:    { min: 0,  max: 500, passo: 2.5 },
    descanso: { min: 10, max: 300, passo: 10 },
  };

  function carregarTreinos() {
    try { return JSON.parse(localStorage.getItem("treinos")) || []; }
    catch { return []; }
  }

  function salvarTreinos() {
    localStorage.setItem("treinos", JSON.stringify(treinos));
  }

  function gerarId() { return Date.now().toString(); }

  function mostrarTela(mostrar, animacao) {
    [telaHome, telaEdicao, telaExercicio].forEach(t => {
      t.classList.add("tela-oculta");
    });
    mostrar.classList.remove("tela-oculta");
    if (animacao) {
      mostrar.classList.remove("animar-direita", "animar-esquerda");
      void mostrar.offsetWidth;
      mostrar.classList.add(animacao);
    }
  }

  function mostrarHome() {
    pararTimer();
    treinoAtualId = null;
    exercicioAtualIndex = null;
    addExercicio.style.display = "none";
    mostrarTela(telaHome, "animar-esquerda");
    renderizarListaTreinos();
  }

  function renderizarListaTreinos() {
    listaTreinos.innerHTML = "";
    if (treinos.length === 0) {
      listaTreinos.innerHTML = `<p class="msg-vazio">Nenhum treino ainda.<br>Crie o primeiro! 💪</p>`;
      return;
    }
    treinos.forEach(t => {
      const card = document.createElement("div");
      card.classList.add("card-treino");
      card.innerHTML = `
        <div>
          <div class="card-treino-nome">${t.nome}</div>
          <div class="card-treino-info">${t.exercicios.length} exercício${t.exercicios.length !== 1 ? "s" : ""}</div>
        </div>
        <div class="card-treino-seta">›</div>
      `;
      card.onclick = () => abrirTreino(t.id);
      listaTreinos.appendChild(card);
    });
  }

  btnNovoTreino.onclick = () => {
    const novo = { id: gerarId(), nome: "Novo treino", exercicios: [] };
    treinos.push(novo);
    salvarTreinos();
    abrirTreino(novo.id);
  };

  function abrirTreino(id) {
    treinoAtualId = id;
    const treino = getTreino();
    nomeTreino.innerText = treino.nome;
    addExercicio.style.display = "flex";
    mostrarTela(telaEdicao, "animar-direita");
    renderizarExercicios();
  }

  function getTreino() {
    return treinos.find(t => t.id === treinoAtualId);
  }

  function renderizarExercicios() {
    const treino = getTreino();
    listaExercicios.innerHTML = "";

    if (treino.exercicios.length === 0) {
      listaExercicios.innerHTML = `<p class="msg-exercicios-vazio">Nenhum exercício ainda.<br>Toque + para adicionar. 💪</p>`;
      return;
    }

    treino.exercicios.forEach((ex, index) => {
      const item = document.createElement("div");
      item.classList.add("item-exercicio");

      const imagem = document.createElement("img");
      imagem.src = ex.img || "";
      imagem.alt = ex.nome;
      if (!ex.img) imagem.style.display = "none";

      const texto = document.createElement("span");
      texto.innerText = ex.nome;

      const infoDir = document.createElement("div");
      infoDir.classList.add("item-ex-info");

      const badge = document.createElement("span");
      badge.innerText = ex.tier || "";
      badge.classList.add("badge-tier", "tier-" + (ex.tier || ""));

      const configInfo = document.createElement("span");
      configInfo.classList.add("item-ex-config");
      configInfo.innerText = `${ex.series || 4}×${ex.reps || 12} · ${ex.carga || 0}kg`;

      infoDir.appendChild(badge);
      infoDir.appendChild(configInfo);

      const btnsOrdem = document.createElement("div");
      btnsOrdem.classList.add("btns-ordem");

      const btnUp = document.createElement("button");
      btnUp.innerText = "↑";
      btnUp.classList.add("btn-ordem");
      btnUp.disabled = index === 0;
      btnUp.onclick = (e) => {
        e.stopPropagation();
        treino.exercicios.splice(index - 1, 0, treino.exercicios.splice(index, 1)[0]);
        salvarTreinos(); renderizarExercicios();
      };

      const btnDown = document.createElement("button");
      btnDown.innerText = "↓";
      btnDown.classList.add("btn-ordem");
      btnDown.disabled = index === treino.exercicios.length - 1;
      btnDown.onclick = (e) => {
        e.stopPropagation();
        treino.exercicios.splice(index + 1, 0, treino.exercicios.splice(index, 1)[0]);
        salvarTreinos(); renderizarExercicios();
      };

      btnsOrdem.appendChild(btnUp);
      btnsOrdem.appendChild(btnDown);

      const remover = document.createElement("button");
      remover.innerText = "❌";
      remover.classList.add("btn-remover");
      remover.onclick = (e) => {
        e.stopPropagation();
        indexRemoverPendente = index;
        txtConfirmarExercicio.innerText = `Remover "${ex.nome}"?`;
        overlayConfirmarExercicio.classList.add("visivel");
      };

      item.onclick = () => abrirExercicio(index);

      item.appendChild(imagem);
      item.appendChild(texto);
      item.appendChild(infoDir);
      item.appendChild(btnsOrdem);
      item.appendChild(remover);
      listaExercicios.appendChild(item);
    });
  }

  function abrirExercicio(index) {
    pararTimer();
    exercicioAtualIndex = index;
    const treino = getTreino();
    const ex = treino.exercicios[index];

    nomeExercicioTela.innerText = ex.nome;
    badgeExercicioTela.innerText = ex.tier || "";
    badgeExercicioTela.className = "badge-tier tier-" + (ex.tier || "");

    if (ex.img) {
      gifExercicio.src = ex.img;
      gifExercicio.style.display = "block";
    } else {
      gifExercicio.style.display = "none";
    }

    valSeries.innerText   = ex.series   ?? 4;
    valReps.innerText     = ex.reps     ?? 12;
    valCarga.innerText    = ex.carga    ?? 0;
    valDescanso.innerText = ex.descanso ?? 90;

    notasExercicio.value = ex.notas || "";

    timerRestante = ex.descanso ?? 90;
    timerTotal    = timerRestante;
    atualizarTimerUI();

    addExercicio.style.display = "none";
    mostrarTela(telaExercicio, "animar-direita");
  }

  function getExercicioAtual() {
    return getTreino().exercicios[exercicioAtualIndex];
  }

  document.querySelectorAll(".btn-num").forEach(btn => {
    btn.onclick = () => {
      const campo = btn.dataset.campo;
      const op    = btn.dataset.op;
      const lim   = LIMITES[campo];
      const ex    = getExercicioAtual();

      let atual = ex[campo] ?? (campo === "series" ? 4 : campo === "reps" ? 12 : campo === "descanso" ? 90 : 0);
      if (op === "+") atual = Math.min(lim.max, atual + lim.passo);
      else            atual = Math.max(lim.min, atual - lim.passo);

      ex[campo] = atual;

      const els = { series: valSeries, reps: valReps, carga: valCarga, descanso: valDescanso };
      els[campo].innerText = atual;

      if (campo === "descanso") {
        pararTimer();
        timerRestante = atual;
        timerTotal    = atual;
        atualizarTimerUI();
      }

      salvarTreinos();
    };
  });

  notasExercicio.addEventListener("input", () => {
    const ex = getExercicioAtual();
    if (ex) { ex.notas = notasExercicio.value; salvarTreinos(); }
  });

  btnVoltarExercicio.onclick = () => {
    pararTimer();
    addExercicio.style.display = "flex";
    mostrarTela(telaEdicao, "animar-esquerda");
    renderizarExercicios();
  };

  nomeTreino.onclick = () => {
    const treino = getTreino();
    const nomeAtual = nomeTreino.innerText;
    const input = document.createElement("input");
    input.type = "text"; input.value = nomeAtual; input.maxLength = 20;
    nomeTreino.innerText = "";
    nomeTreino.appendChild(input);
    input.focus(); input.select();
    const salvar = () => {
      let n = input.value.trim().slice(0, 20);
      if (!n) n = "Novo treino";
      treino.nome = n; salvarTreinos(); nomeTreino.innerText = n;
    };
    input.addEventListener("blur", salvar);
    input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
  };

  btnVoltar.onclick = () => mostrarHome();

  btnApagarTreino.onclick = () => overlayConfirmarTreino.classList.add("visivel");
  btnConfirmarApagarTreino.onclick = () => {
    treinos = treinos.filter(t => t.id !== treinoAtualId);
    salvarTreinos();
    overlayConfirmarTreino.classList.remove("visivel");
    mostrarHome();
  };
  btnCancelarApagarTreino.onclick = () => overlayConfirmarTreino.classList.remove("visivel");

  btnConfirmarRemoverEx.onclick = () => {
    if (indexRemoverPendente === null) return;
    getTreino().exercicios.splice(indexRemoverPendente, 1);
    salvarTreinos(); renderizarExercicios();
    overlayConfirmarExercicio.classList.remove("visivel");
    indexRemoverPendente = null;
  };
  btnCancelarRemoverEx.onclick = () => {
    overlayConfirmarExercicio.classList.remove("visivel");
    indexRemoverPendente = null;
  };

  function atualizarTimerUI() {
    const min = Math.floor(timerRestante / 60);
    const seg = timerRestante % 60;
    timerDisplay.innerText = `${min}:${String(seg).padStart(2, "0")}`;
    const pct = timerTotal > 0 ? (timerRestante / timerTotal) * 100 : 100;
    timerBarraFill.style.width = pct + "%";
    const urgente = timerRestante <= 10 && timerRestante > 0;
    timerDisplay.classList.toggle("urgente", urgente);
    timerBarraFill.classList.toggle("urgente", urgente);
  }

  function pararTimer() {
    clearInterval(timerIntervalo);
    timerIntervalo = null;
    timerRodando = false;
    btnIniciarTimer.innerText = "▶ Iniciar descanso";
    btnIniciarTimer.classList.remove("pausado");
  }

  btnIniciarTimer.onclick = () => {
    if (timerRodando) {
      pararTimer();
      return;
    }
    if (timerRestante <= 0) {
      timerRestante = timerTotal;
      atualizarTimerUI();
    }
    timerRodando = true;
    btnIniciarTimer.innerText = "⏸ Pausar";
    btnIniciarTimer.classList.add("pausado");
    timerIntervalo = setInterval(() => {
      timerRestante--;
      atualizarTimerUI();
      if (timerRestante <= 0) {
        pararTimer();
        timerDisplay.innerText = "0:00";
        timerBarraFill.style.width = "0%";
        if ("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
      }
    }, 1000);
  };

  btnResetTimer.onclick = () => {
    pararTimer();
    const ex = getExercicioAtual();
    timerRestante = ex ? (ex.descanso ?? 90) : 90;
    timerTotal    = timerRestante;
    atualizarTimerUI();
  };

  function exercicioPassaFiltros(ex) {
    if (filtroTierAtivo && ex.tier !== filtroTierAtivo) return false;
    if (filtroGrupoAtivo) {
      const grupo = GRUPOS.find(g => g.label === filtroGrupoAtivo);
      if (grupo) {
        const foco = (ex.foco || "").toLowerCase();
        if (!grupo.termos.some(t => foco.includes(t))) return false;
      }
    }
    return true;
  }

  function renderizarSugestoes() {
    const valor = inputBusca.value.toLowerCase();
    sugestoes.innerHTML = "";
    const resultados = baseExercicios
      .filter(ex => exercicioPassaFiltros(ex))
      .filter(ex => !valor || ex.nome.toLowerCase().includes(valor))
      .slice(0, 8);

    if (resultados.length === 0) {
      sugestoes.innerHTML = `<p style="color:#999;font-size:13px;text-align:center;padding:10px">Nenhum exercício encontrado</p>`;
      return;
    }

    resultados.forEach(ex => {
      const item = document.createElement("div");
      const nome = document.createElement("span");
      nome.innerText = ex.nome;
      const badge = document.createElement("span");
      badge.innerText = ex.tier;
      badge.classList.add("badge-tier", "tier-" + ex.tier);
      const infoBtn = document.createElement("button");
      infoBtn.innerText = "ℹ️";
      infoBtn.style.cssText = "background:none;border:none;cursor:pointer;font-size:16px;flex-shrink:0";

      nome.onclick = () => {
        getTreino().exercicios.push({
          nome: ex.nome, img: ex.img, tier: ex.tier,
          series: 4, reps: 12, carga: 0, descanso: 90, notas: ""
        });
        salvarTreinos(); renderizarExercicios();
        overlayBusca.classList.remove("visivel");
        inputBusca.value = ""; sugestoes.innerHTML = "";
      };

      infoBtn.onclick = (e) => {
        e.stopPropagation();
        document.getElementById("infoNome").innerText        = ex.nome;
        document.getElementById("infotier").innerText        = "Tier: " + ex.tier;
        document.getElementById("infofoco").innerText        = "Foco: " + ex.foco;
        document.getElementById("infoDificuldade").innerText = "Dificuldade: " + ex.dificuldade;
        document.getElementById("infoDescricao").innerText   = ex.descricao;
        const infoImg = document.getElementById("infoImg");
        infoImg.src = ex.img || "";
        infoImg.style.display = ex.img ? "block" : "none";
        document.getElementById("infoExercicio").classList.add("visivel");
      };

      item.appendChild(nome); item.appendChild(badge); item.appendChild(infoBtn);
      sugestoes.appendChild(item);
    });
  }

  function criarFiltros() {
    filtroGrupos.innerHTML = "";
    const btnTodos = document.createElement("button");
    btnTodos.innerText = "Todos";
    btnTodos.classList.add("chip-filtro", "ativo");
    btnTodos.onclick = () => {
      filtroGrupoAtivo = null;
      document.querySelectorAll("#filtroGrupos .chip-filtro").forEach(b => b.classList.remove("ativo"));
      btnTodos.classList.add("ativo");
      renderizarSugestoes();
    };
    filtroGrupos.appendChild(btnTodos);

    GRUPOS.forEach(g => {
      const btn = document.createElement("button");
      btn.innerText = g.label;
      btn.classList.add("chip-filtro");
      btn.onclick = () => {
        filtroGrupoAtivo = filtroGrupoAtivo === g.label ? null : g.label;
        document.querySelectorAll("#filtroGrupos .chip-filtro").forEach(b => b.classList.remove("ativo"));
        if (filtroGrupoAtivo) btn.classList.add("ativo");
        else btnTodos.classList.add("ativo");
        renderizarSugestoes();
      };
      filtroGrupos.appendChild(btn);
    });

    filtroTiers.innerHTML = "";
    const btnTodosTier = document.createElement("button");
    btnTodosTier.innerText = "Todos tiers";
    btnTodosTier.classList.add("chip-filtro", "ativo");
    btnTodosTier.onclick = () => {
      filtroTierAtivo = null;
      document.querySelectorAll("#filtroTiers .chip-filtro").forEach(b => b.classList.remove("ativo"));
      btnTodosTier.classList.add("ativo");
      renderizarSugestoes();
    };
    filtroTiers.appendChild(btnTodosTier);

    TIERS.forEach(tier => {
      const btn = document.createElement("button");
      btn.innerText = tier;
      btn.classList.add("chip-filtro", "chip-tier", "tier-" + tier);
      btn.onclick = () => {
        filtroTierAtivo = filtroTierAtivo === tier ? null : tier;
        document.querySelectorAll("#filtroTiers .chip-filtro").forEach(b => b.classList.remove("ativo"));
        if (filtroTierAtivo) btn.classList.add("ativo");
        else btnTodosTier.classList.add("ativo");
        renderizarSugestoes();
      };
      filtroTiers.appendChild(btn);
    });
  }

  addExercicio.onclick = () => {
    filtroGrupoAtivo = null; filtroTierAtivo = null;
    overlayBusca.classList.add("visivel");
    inputBusca.value = ""; sugestoes.innerHTML = "";
    criarFiltros(); inputBusca.focus();
  };

  inputBusca.addEventListener("input", renderizarSugestoes);

  overlayBusca.onclick = (e) => {
    if (e.target === overlayBusca) overlayBusca.classList.remove("visivel");
  };

  document.getElementById("fecharInfo").onclick = () => {
    document.getElementById("infoExercicio").classList.remove("visivel");
  };

  btnDarkMode.onclick = () => {
    document.body.classList.toggle("dark");
    btnDarkMode.innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
    localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "1" : "0");
  };

  if (localStorage.getItem("darkMode") === "1") {
    document.body.classList.add("dark");
    btnDarkMode.innerText = "☀️";
  }

  mostrarHome();
});
