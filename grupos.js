// Demo data (POC)
const competencias = [
  { id: 1, nombre: "Competencia Semanal - Tech", desc: "Top returns en 7 días. Reglas simples.", estado: "Inscripción abierta", cupos: 128 },
  { id: 2, nombre: "Reto Mensual - Value", desc: "Hold y rebalanceo semanal. Sin apalancamiento.", estado: "En curso", cupos: 256 },
  { id: 3, nombre: "Torneo Flash (24h)", desc: "Trading rápido. Riesgo alto. Solo demo.", estado: "Inscripción abierta", cupos: 64 },
  { id: 4, nombre: "Competencia Q1 - Macro", desc: "Estrategias macro con ETFs. (Demo)", estado: "Próximamente", cupos: 512 },
  { id: 5, nombre: "Desafío de Consistencia", desc: "Gana por estabilidad, no solo retorno.", estado: "Inscripción abierta", cupos: 200 },
  { id: 6, nombre: "Mini Liga Universitaria", desc: "POC para campus y amigos.", estado: "En curso", cupos: 40 },
  { id: 7, nombre: "Campeonato de Drawdown Bajo", desc: "Penaliza caídas fuertes. (Demo)", estado: "Inscripción abierta", cupos: 100 }
];

const ligas = [
  { id: 101, nombre: "Liga: Amigos de Trading", desc: "Privada. Código por invitación.", estado: "Privada", cupos: 20 },
  { id: 102, nombre: "Liga: MSU Finance Club", desc: "Pública. Temporada 2026.", estado: "Pública", cupos: 60 },
  { id: 103, nombre: "Liga: Colombia Traders", desc: "Pública. Ranking semanal.", estado: "Pública", cupos: 300 },
  { id: 104, nombre: "Liga: Cripto Demo", desc: "Solo activos cripto (simulado).", estado: "Pública", cupos: 180 },
  { id: 105, nombre: "Liga: Long-term Holders", desc: "Reglas: 1 compra por semana.", estado: "Pública", cupos: 120 },
  { id: 106, nombre: "Liga: Risk Parity POC", desc: "Objetivo: volatilidad estable.", estado: "Pública", cupos: 80 }
];

const hallOfFame = [
  { name: "Nolmportant3", ret2y: 98.86, style: "Crecimiento consistente", seed: "N" },
  { name: "MihailTsankov", ret2y: 90.17, style: "Momentum", seed: "M" },
  { name: "Changwei", ret2y: 62.22, style: "Value + paciencia", seed: "C" },
  { name: "JordanBoer", ret2y: -22.19, style: "Alta varianza", seed: "J" },
  { name: "ArtemisQuant", ret2y: 54.10, style: "Bajo drawdown", seed: "A" }
];

let mode = "competencias"; // or "ligas"

const leftListEl = document.getElementById("leftList");
const hofListEl = document.getElementById("hofList");

const tabC = document.getElementById("tab-competencias");
const tabL = document.getElementById("tab-ligas");

const leftSearch = document.getElementById("leftSearch");
const leftSearchBtn = document.getElementById("leftSearchBtn");

function formatPct(x){
  const sign = x > 0 ? "+" : "";
  return `${sign}${x.toFixed(2)}%`;
}

function renderHallOfFame(){
  hofListEl.innerHTML = "";
  hallOfFame.slice(0,5).forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "hofRow";

    const left = document.createElement("div");
    left.className = "hofLeft";

    const rank = document.createElement("div");
    rank.className = "rank";
    rank.textContent = `#${i+1}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = p.seed;

    const nameBlock = document.createElement("div");
    nameBlock.className = "nameBlock";

    const name = document.createElement("p");
    name.className = "hofName";
    name.textContent = p.name;

    const meta = document.createElement("p");
    meta.className = "hofMeta";
    meta.textContent = `${p.style} · Return (2Y)`;

    nameBlock.appendChild(name);
    nameBlock.appendChild(meta);

    left.appendChild(rank);
    left.appendChild(avatar);
    left.appendChild(nameBlock);

    const ret = document.createElement("div");
    ret.className = "return " + (p.ret2y >= 0 ? "pos" : "neg");
    ret.textContent = formatPct(p.ret2y);

    li.appendChild(left);
    li.appendChild(ret);
    hofListEl.appendChild(li);
  });
}

function getCurrentList(){
  return mode === "competencias" ? competencias : ligas;
}

function renderLeftList(filterText = ""){
  const data = getCurrentList();
  const q = filterText.trim().toLowerCase();

  const filtered = q
    ? data.filter(x => (x.nombre + " " + x.desc + " " + x.estado).toLowerCase().includes(q))
    : data;

  leftListEl.innerHTML = "";

  filtered.forEach((x) => {
    const row = document.createElement("div");
    row.className = "item";

    const leftMeta = document.createElement("div");
    leftMeta.className = "leftMeta";

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = mode === "competencias" ? "C" : "L";

    const titleWrap = document.createElement("div");
    titleWrap.className = "titleWrap";

    const title = document.createElement("p");
    title.className = "itemTitle";
    title.textContent = x.nombre;

    const sub = document.createElement("p");
    sub.className = "itemSub";
    sub.textContent = `${x.desc} · ${x.estado} · Cupos: ${x.cupos}`;

    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);

    leftMeta.appendChild(badge);
    leftMeta.appendChild(titleWrap);

    const actions = document.createElement("div");
    actions.className = "actions";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = x.estado;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = (x.estado.toLowerCase().includes("abierta") || x.estado.toLowerCase().includes("pública"))
      ? "Inscribirme"
      : (x.estado.toLowerCase().includes("privada") ? "Solicitar acceso" : "Ver detalles");

    btn.addEventListener("click", () => {
      alert(`${btn.textContent}: ${x.nombre}\n(POC)`);
    });

    actions.appendChild(tag);
    actions.appendChild(btn);

    row.appendChild(leftMeta);
    row.appendChild(actions);

    leftListEl.appendChild(row);
  });

  if (filtered.length === 0){
    const empty = document.createElement("div");
    empty.className = "item";
    empty.innerHTML = `
      <div class="leftMeta">
        <div class="badge">!</div>
        <div class="titleWrap">
          <p class="itemTitle">Sin resultados</p>
          <p class="itemSub">Prueba con otro término de búsqueda.</p>
        </div>
      </div>
      <div class="actions">
        <span class="tag">Filtro</span>
      </div>
    `;
    leftListEl.appendChild(empty);
  }
}

function setMode(nextMode){
  mode = nextMode;

  // tabs UI
  const isC = mode === "competencias";
  tabC.classList.toggle("active", isC);
  tabL.classList.toggle("active", !isC);
  tabC.setAttribute("aria-selected", String(isC));
  tabL.setAttribute("aria-selected", String(!isC));

  // reset search
  leftSearch.value = "";
  renderLeftList("");
}

tabC.addEventListener("click", () => setMode("competencias"));
tabL.addEventListener("click", () => setMode("ligas"));

leftSearch.addEventListener("input", (e) => renderLeftList(e.target.value));
leftSearchBtn.addEventListener("click", () => renderLeftList(leftSearch.value));

// init
renderHallOfFame();
renderLeftList();