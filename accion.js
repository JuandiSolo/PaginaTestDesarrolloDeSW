// stock.js
(function () {
  // ====== Simple candlestick chart (demo) ======
  const canvas = document.getElementById("candleCanvas");
  const ctx = canvas.getContext("2d");

  // HiDPI crisp
  function setupHiDPI() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth;
    const cssH = Math.round(cssW * (520 / 1200)); // keep ratio similar
    canvas.style.height = cssH + "px";

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(n) { return Math.random() * n; }

  function generateOHLC(count = 55) {
    let price = 170 + rand(6);
    const data = [];
    for (let i = 0; i < count; i++) {
      const open = price;
      const move = (rand(2.2) - 1.1);
      const close = open + move;
      const high = Math.max(open, close) + rand(1.6);
      const low  = Math.min(open, close) - rand(1.6);
      price = close + (rand(0.6) - 0.3);
      data.push({ open, high, low, close });
    }
    return data;
  }

  function drawChart(data) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pad = 18;

    // background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#080c17";
    roundRect(ctx, 0, 0, w, h, 14, true, false);

    // grid
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    for (let i = 1; i <= 8; i++) {
      const y = pad + (i * (h - pad * 2)) / 9;
      line(ctx, pad, y, w - pad, y);
    }
    for (let i = 1; i <= 10; i++) {
      const x = pad + (i * (w - pad * 2)) / 11;
      line(ctx, x, pad, x, h - pad);
    }
    ctx.globalAlpha = 1;

    // find range
    let min = Infinity, max = -Infinity;
    for (const c of data) { min = Math.min(min, c.low); max = Math.max(max, c.high); }
    const range = Math.max(0.0001, max - min);

    const plotW = w - pad * 2;
    const plotH = h - pad * 2;
    const cw = plotW / data.length;
    const bodyW = Math.max(4, cw * 0.55);

    // moving averages (simple)
    const maFast = movingAverage(data.map(d => d.close), 8);
    const maSlow = movingAverage(data.map(d => d.close), 18);

    // candles
    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const xCenter = pad + i * cw + cw / 2;

      const yOpen  = pad + (max - c.open)  * (plotH / range);
      const yClose = pad + (max - c.close) * (plotH / range);
      const yHigh  = pad + (max - c.high)  * (plotH / range);
      const yLow   = pad + (max - c.low)   * (plotH / range);

      const up = c.close >= c.open;

      // wick
      ctx.strokeStyle = up ? "rgba(39,208,125,0.95)" : "rgba(255,77,109,0.95)";
      ctx.lineWidth = 1.4;
      line(ctx, xCenter, yHigh, xCenter, yLow);

      // body
      const yTop = Math.min(yOpen, yClose);
      const yBot = Math.max(yOpen, yClose);
      ctx.fillStyle = up ? "rgba(39,208,125,0.85)" : "rgba(255,77,109,0.85)";
      ctx.fillRect(xCenter - bodyW / 2, yTop, bodyW, Math.max(2, yBot - yTop));
    }

    // MA lines
    drawLineSeries(maFast, "#ff9f43", 2.2, pad, plotW, plotH, min, max); // orange-ish
    drawLineSeries(maSlow, "#ff3b8d", 2.2, pad, plotW, plotH, min, max); // pink-ish

    // border
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    roundRect(ctx, 0.5, 0.5, w - 1, h - 1, 14, false, true);
  }

  function drawLineSeries(series, color, width, pad, plotW, plotH, min, max) {
    const range = Math.max(0.0001, max - min);
    const cw = plotW / series.length;

    ctx.beginPath();
    for (let i = 0; i < series.length; i++) {
      const v = series[i];
      if (v == null) continue;
      const x = pad + i * cw + cw / 2;
      const y = pad + (max - v) * (plotH / range);
      if (i === 0 || series[i - 1] == null) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function movingAverage(values, period) {
    const out = new Array(values.length).fill(null);
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= period) sum -= values[i - period];
      if (i >= period - 1) out[i] = sum / period;
    }
    return out;
  }

  function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // ====== Sentiment engine (demo heuristic) ======
  const elInput = document.getElementById("newsInput");
  const elAnalyze = document.getElementById("btnAnalyze");
  const elClear = document.getElementById("btnClear");
  const elBadge = document.getElementById("moodBadge");
  const elList = document.getElementById("classifiedList");

  const bullBar = document.getElementById("bullBar");
  const neuBar = document.getElementById("neuBar");
  const bearBar = document.getElementById("bearBar");
  const bullVal = document.getElementById("bullVal");
  const neuVal = document.getElementById("neuVal");
  const bearVal = document.getElementById("bearVal");

  const POS = ["beats", "surge", "record", "strong", "growth", "upgrade", "profit", "wins", "demand", "bull", "rally", "expands", "breakthrough", "partnership"];
  const NEG = ["miss", "lawsuit", "probe", "investigate", "downgrade", "weak", "decline", "fraud", "ban", "layoffs", "crash", "loss", "risk", "recall", "cuts", "warning"];

  function classifyHeadline(text) {
    const t = text.toLowerCase();
    let score = 0;
    for (const w of POS) if (t.includes(w)) score += 1;
    for (const w of NEG) if (t.includes(w)) score -= 1;

    if (score >= 1) return "Bullish";
    if (score <= -1) return "Bearish";
    return "Neutral";
  }

  function setBadge(mood) {
    elBadge.textContent = mood;
    elBadge.className = "resultBadge";
    if (mood === "Bullish") elBadge.style.borderColor = "rgba(39,208,125,.35)";
    else if (mood === "Bearish") elBadge.style.borderColor = "rgba(255,77,109,.35)";
    else elBadge.style.borderColor = "rgba(125,138,168,.35)";
  }

  function setBars(bullPct, neuPct, bearPct) {
    bullBar.style.width = bullPct + "%";
    neuBar.style.width = neuPct + "%";
    bearBar.style.width = bearPct + "%";
    bullVal.textContent = bullPct + "%";
    neuVal.textContent = neuPct + "%";
    bearVal.textContent = bearPct + "%";
  }

  function renderList(items) {
    elList.innerHTML = "";
    for (const it of items) {
      const row = document.createElement("div");
      row.className = "item";

      const text = document.createElement("div");
      text.className = "itemText";
      text.textContent = it.headline;

      const tag = document.createElement("div");
      tag.className = "tag " + (it.label === "Bullish" ? "bull" : it.label === "Bearish" ? "bear" : "neu");
      tag.textContent = it.label;

      row.appendChild(text);
      row.appendChild(tag);
      elList.appendChild(row);
    }
  }

  elAnalyze.addEventListener("click", () => {
    const lines = elInput.value
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setBadge("—");
      setBars(0, 0, 0);
      elList.innerHTML = "";
      return;
    }

    // Demo heuristic classification
    const classified = lines.map(h => ({ headline: h, label: classifyHeadline(h) }));

    const bull = classified.filter(x => x.label === "Bullish").length;
    const neu  = classified.filter(x => x.label === "Neutral").length;
    const bear = classified.filter(x => x.label === "Bearish").length;

    const total = classified.length;
    const bullPct = Math.round((bull / total) * 100);
    const neuPct  = Math.round((neu  / total) * 100);
    const bearPct = Math.max(0, 100 - bullPct - neuPct);

    setBars(bullPct, neuPct, bearPct);

    // overall mood by majority
    let mood = "Neutral";
    if (bull > bear && bull > neu) mood = "Bullish";
    else if (bear > bull && bear > neu) mood = "Bearish";
    setBadge(mood);

    renderList(classified);

    // ====== Where you would call OpenAI later ======
    // You can replace the heuristic with a real request returning JSON like:
    // [{ "headline": "...", "label": "Bullish|Bearish|Neutral" }, ...]
    //
    // fetch("/api/sentiment", { method:"POST", headers:{...}, body: JSON.stringify({ symbol:"AAPL", headlines: lines }) })
    //   .then(r => r.json())
    //   .then(json => { ... update bars + list ... });
  });

  elClear.addEventListener("click", () => {
    elInput.value = "";
    setBadge("—");
    setBars(0, 0, 0);
    elList.innerHTML = "";
  });

  // ====== header mock price ======
  function setMockPrice() {
    const priceEl = document.getElementById("priceValue");
    const deltaEl = document.getElementById("priceDelta");
    const base = 170 + rand(6);
    const pct = (rand(3.2) - 1.6);
    const price = base * (1 + pct / 100);
    priceEl.textContent = "$" + price.toFixed(2);
    deltaEl.textContent = (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
    deltaEl.className = "priceDelta " + (pct >= 0 ? "up" : "down");
  }

  // Buttons
  document.getElementById("btnRegenerate").addEventListener("click", () => {
    setMockPrice();
    const data = generateOHLC(58);
    drawChart(data);
  });

  document.getElementById("btnZoom").addEventListener("click", () => {
    // demo only: redraw with fewer candles
    const data = generateOHLC(34);
    drawChart(data);
  });

  // Init
  function init() {
    setupHiDPI();
    setMockPrice();
    drawChart(generateOHLC(58));
  }

  window.addEventListener("resize", () => {
    setupHiDPI();
    drawChart(generateOHLC(58));
  });

  init();
})();