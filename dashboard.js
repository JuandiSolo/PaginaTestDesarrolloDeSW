// ===== Mock data + simple portfolio engine (for UI demo) =====

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const state = {
  user: {
    username: "NombreUsuario",
    isNew: true,
    seedMoney: 10000,
  },
  // Cash you can use
  cash: 0,
  // Positions: qty + avgCost + currentPrice + prevClose
  positions: [
    { sym: "AAPL", qty: 8, avgCost: 165.00, price: 172.40, prevClose: 170.20 },
    { sym: "TSLA", qty: 2, avgCost: 240.00, price: 233.10, prevClose: 236.90 },
    { sym: "NVDA", qty: 1, avgCost: 820.00, price: 860.30, prevClose: 852.00 },
  ],
  goal: 25000, // just for progress bar
};

const els = {
  username: document.getElementById("username"),
  userTag: document.getElementById("userTag"),
  userHint: document.getElementById("userHint"),

  totalValue: document.getElementById("totalValue"),
  dailyDelta: document.getElementById("dailyDelta"),
  progressBar: document.getElementById("progressBar"),
  progressLabel: document.getElementById("progressLabel"),

  assetsRows: document.getElementById("assetsRows"),

  dailyPL: document.getElementById("dailyPL"),
  dailyPLPct: document.getElementById("dailyPLPct"),
  dayStatus: document.getElementById("dayStatus"),
  bestAsset: document.getElementById("bestAsset"),
  worstAsset: document.getElementById("worstAsset"),

  equityTotal: document.getElementById("equityTotal"),
  cashAvailable: document.getElementById("cashAvailable"),
  equityTotal2: document.getElementById("equityTotal2"),
  cashAvailable2: document.getElementById("cashAvailable2"),
  seedMoney: document.getElementById("seedMoney"),

  // Ticket
  sym: document.getElementById("sym"),
  orderType: document.getElementById("orderType"),
  qty: document.getElementById("qty"),
  limitWrap: document.getElementById("limitWrap"),
  limitPrice: document.getElementById("limitPrice"),
  tif: document.getElementById("tif"),
  markPrice: document.getElementById("markPrice"),
  estCost: document.getElementById("estCost"),
  cashAfter: document.getElementById("cashAfter"),
  ticketStatus: document.getElementById("ticketStatus"),
  log: document.getElementById("log"),

  btnBuy: document.getElementById("btnBuy"),
  btnSell: document.getElementById("btnSell"),
  btnRefresh: document.getElementById("btnRefresh"),
};

function initUser() {
  els.username.textContent = state.user.username;

  if (state.user.isNew) {
    state.cash = state.user.seedMoney;
    els.userTag.textContent = "Nuevo";
    els.userTag.style.background = "rgba(37,208,111,.12)";
    els.userTag.style.color = "var(--green)";
    els.userHint.textContent = "Seed money aplicado automáticamente.";
  } else {
    els.userTag.textContent = "Activo";
    els.userHint.textContent = "Bienvenido de vuelta.";
  }

  els.seedMoney.textContent = fmtMoney(state.user.seedMoney);
  logLine(`Seed money: ${fmtMoney(state.user.seedMoney)} (si aplica)`);
}

function portfolioMarketValue() {
  return state.positions.reduce((acc, p) => acc + p.qty * p.price, 0);
}

function equityTotal() {
  return state.cash + portfolioMarketValue();
}

function dailyPLValue() {
  // P/L del día aproximado = sum(qty * (price - prevClose))
  return state.positions.reduce((acc, p) => acc + p.qty * (p.price - p.prevClose), 0);
}

function dailyPLPct() {
  // % vs equity "de ayer" aproximada: cash + sum(qty * prevClose)
  const prevEquity = state.cash + state.positions.reduce((acc, p) => acc + p.qty * p.prevClose, 0);
  if (prevEquity <= 0) return 0;
  return (dailyPLValue() / prevEquity) * 100;
}

function bestWorstAssets() {
  if (state.positions.length === 0) return { best: "—", worst: "—" };

  const changes = state.positions.map(p => ({
    sym: p.sym,
    delta: (p.price - p.prevClose),
  }));

  changes.sort((a, b) => b.delta - a.delta);
  const best = changes[0];
  const worst = changes[changes.length - 1];

  return {
    best: `${best.sym} (${best.delta >= 0 ? "+" : ""}${best.delta.toFixed(2)})`,
    worst: `${worst.sym} (${worst.delta >= 0 ? "+" : ""}${worst.delta.toFixed(2)})`,
  };
}

function renderAssets() {
  els.assetsRows.innerHTML = "";

  if (state.positions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "trow";
    empty.innerHTML = `<div class="muted">Sin posiciones</div><div></div><div></div><div></div>`;
    els.assetsRows.appendChild(empty);
    return;
  }

  state.positions.forEach(p => {
    const row = document.createElement("div");
    row.className = "trow";

    const val = p.qty * p.price;
    row.innerHTML = `
      <div><strong>${p.sym}</strong></div>
      <div class="right">${p.qty}</div>
      <div class="right">${fmtMoney(p.price)}</div>
      <div class="right"><strong>${fmtMoney(val)}</strong></div>
    `;
    els.assetsRows.appendChild(row);
  });
}

function renderTotals() {
  const eq = equityTotal();
  const cash = state.cash;
  const mv = portfolioMarketValue();

  // Total value (for UI): same as equity total
  els.totalValue.textContent = fmtMoney(eq);
  els.equityTotal.textContent = fmtMoney(eq);
  els.equityTotal2.textContent = fmtMoney(eq);

  els.cashAvailable.textContent = fmtMoney(cash);
  els.cashAvailable2.textContent = fmtMoney(cash);

  const dpl = dailyPLValue();
  const dplPct = dailyPLPct();

  els.dailyPL.textContent = fmtMoney(dpl);
  els.dailyPLPct.textContent = `${dplPct.toFixed(2)}%`;

  // daily delta pill
  els.dailyDelta.textContent = `${dpl >= 0 ? "+" : ""}${fmtMoney(dpl)}`;

  // Color status
  setSignedEl(els.dailyPL, dpl);
  setSignedEl(els.dailyDelta, dpl);

  if (dpl >= 0) {
    els.dayStatus.textContent = "Positivo";
    els.dayStatus.className = "pos";
  } else {
    els.dayStatus.textContent = "Negativo";
    els.dayStatus.className = "neg";
  }

  // Best/worst
  const bw = bestWorstAssets();
  els.bestAsset.textContent = bw.best;
  els.worstAsset.textContent = bw.worst;

  // Progress vs goal
  const pct = Math.max(0, Math.min(100, (eq / state.goal) * 100));
  els.progressBar.style.width = `${pct}%`;
  els.progressLabel.textContent = `${pct.toFixed(0)}% del objetivo (${fmtMoney(state.goal)})`;

  // Also show market value info in logs sometimes
  // (not displayed elsewhere, but kept for future expansion)
  void mv;
}

function setSignedEl(el, n) {
  el.classList.remove("pos", "neg");
  el.classList.add(n >= 0 ? "pos" : "neg");
}

function mockMarkPrice(sym) {
  // If it exists in positions, use that; otherwise create a deterministic-ish price
  const found = state.positions.find(p => p.sym.toUpperCase() === sym.toUpperCase());
  if (found) return found.price;

  // pseudo-price
  const s = sym.toUpperCase().slice(0, 6);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 10000;
  return (50 + (h / 100)).toFixed(2) * 1;
}

function updateTicketUI() {
  const sym = els.sym.value.trim().toUpperCase() || "AAPL";
  els.sym.value = sym;

  const mark = mockMarkPrice(sym);
  els.markPrice.value = fmtMoney(mark);

  const qty = Math.max(1, parseInt(els.qty.value || "1", 10));
  els.qty.value = qty;

  const type = els.orderType.value;
  els.limitWrap.style.display = type === "limit" ? "flex" : "none";

  const px = type === "limit" ? Math.max(0, parseFloat(els.limitPrice.value || "0")) : mark;
  if (type === "limit") els.limitPrice.value = px.toFixed(2);

  const est = qty * px;
  els.estCost.textContent = fmtMoney(est);
  els.cashAfter.textContent = fmtMoney(state.cash - est);
  els.ticketStatus.textContent = "Listo";
  els.ticketStatus.className = "muted";
}

function execute(side) {
  const sym = els.sym.value.trim().toUpperCase();
  const type = els.orderType.value;

  const qty = Math.max(1, parseInt(els.qty.value || "1", 10));
  const mark = mockMarkPrice(sym);
  const px = type === "limit" ? Math.max(0, parseFloat(els.limitPrice.value || "0")) : mark;

  const cost = qty * px;

  // Basic checks (demo)
  if (side === "BUY") {
    if (cost > state.cash) {
      els.ticketStatus.textContent = "Fondos insuficientes";
      els.ticketStatus.className = "neg";
      logLine(`❌ BUY ${sym} x${qty} @ ${fmtMoney(px)} (fondos insuficientes)`);
      return;
    }
    // Apply
    state.cash -= cost;
    upsertPosition(sym, qty, px);
    logLine(`✅ BUY ${sym} x${qty} @ ${fmtMoney(px)} (${type.toUpperCase()})`);
  } else {
    const pos = state.positions.find(p => p.sym === sym);
    if (!pos || pos.qty < qty) {
      els.ticketStatus.textContent = "No tienes suficiente cantidad";
      els.ticketStatus.className = "neg";
      logLine(`❌ SELL ${sym} x${qty} @ ${fmtMoney(px)} (sin cantidad)`);
      return;
    }
    // Apply
    pos.qty -= qty;
    state.cash += cost;
    if (pos.qty === 0) state.positions = state.positions.filter(p => p.sym !== sym);
    logLine(`✅ SELL ${sym} x${qty} @ ${fmtMoney(px)} (${type.toUpperCase()})`);
  }

  // In a real app, currentPrice comes from market. Here we set it to px to reflect action.
  const p2 = state.positions.find(p => p.sym === sym);
  if (p2) p2.price = px;

  renderAll();
}

function upsertPosition(sym, addQty, fillPx) {
  const pos = state.positions.find(p => p.sym === sym);
  if (!pos) {
    state.positions.push({
      sym,
      qty: addQty,
      avgCost: fillPx,
      price: fillPx,
      prevClose: fillPx * (1 - 0.01), // arbitrary
    });
    return;
  }
  // Weighted average cost
  const totalQty = pos.qty + addQty;
  const newAvg = ((pos.avgCost * pos.qty) + (fillPx * addQty)) / totalQty;
  pos.qty = totalQty;
  pos.avgCost = newAvg;
}

function logLine(text) {
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<span class="time">${nowTime()}</span>${text}`;
  els.log.prepend(item);
}

function mockRefreshPrices() {
  // small random walk
  state.positions.forEach(p => {
    const move = (Math.random() - 0.5) * 2.2; // [-1.1, 1.1]
    p.price = Math.max(0.01, +(p.price + move).toFixed(2));
  });
  logLine("🔄 Precios actualizados (mock).");
}

function renderAll() {
  renderAssets();
  renderTotals();
  updateTicketUI();
}

// Events
els.orderType.addEventListener("change", updateTicketUI);
els.sym.addEventListener("input", updateTicketUI);
els.qty.addEventListener("input", updateTicketUI);
els.limitPrice.addEventListener("input", updateTicketUI);

els.btnBuy.addEventListener("click", () => execute("BUY"));
els.btnSell.addEventListener("click", () => execute("SELL"));

els.btnRefresh.addEventListener("click", () => {
  mockRefreshPrices();
  renderAll();
});

document.getElementById("btnLogout").addEventListener("click", () => {
  logLine("👋 Logout (mock).");
});

// Boot
initUser();
renderAll();