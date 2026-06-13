/*
  competitors.js
  --------------
  Preenche a view "Concorrentes":
  - Seletor de produto do catálogo
  - Gráfico de histórico de preço (você vs menor concorrente)
  - Lista de concorrentes encontrados para o produto selecionado
*/

let priceHistoryChartInstance = null;

/**
 * Preenche o seletor de produtos com os itens monitorados da conta atual.
 */
function populateCompetitorProductSelect() {
  const select = document.getElementById("competitorProductSelect");
  const accountId = getCurrentAccountId();
  const accountData = MOCK_COMPETITOR_DATA[accountId];

  select.innerHTML = "";

  if (!accountData || accountData.products.length === 0) {
    select.innerHTML = `<option value="">Nenhum produto monitorado nesta conta</option>`;
    return;
  }

  accountData.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.name;
    select.appendChild(option);
  });
}

/**
 * Renderiza o gráfico de histórico de preço para um produto específico.
 * @param {object} product - item de MOCK_COMPETITOR_DATA[accountId].products
 */
function renderPriceHistoryChart(product) {
  const ctx = document.getElementById("priceHistoryChart");

  if (priceHistoryChartInstance) {
    priceHistoryChartInstance.destroy();
  }

  priceHistoryChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: product.history.labels,
      datasets: [
        {
          label: "Seu preço",
          data: product.history.yourPrice,
          borderColor: "#1a1a2e",
          backgroundColor: "transparent",
          tension: 0,
          pointRadius: 0,
          borderDash: [4, 4],
          borderWidth: 2,
        },
        {
          label: "Menor concorrente",
          data: product.history.competitor,
          borderColor: "#5b7fff",
          backgroundColor: "rgba(91, 127, 255, 0.1)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "#6b6b7d" } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#a3a0b3" } },
        y: { grid: { color: "#ebe6dc" }, ticks: { color: "#a3a0b3" } },
      },
    },
  });
}

/**
 * Renderiza a lista de concorrentes encontrados para o produto selecionado.
 * @param {object} product
 */
function renderCompetitorList(product) {
  const list = document.getElementById("competitorListBox");
  list.innerHTML = "";

  if (product.competitors.length === 0) {
    list.innerHTML = `<li>Nenhum concorrente encontrado para este produto.</li>`;
    return;
  }

  product.competitors.forEach((c) => {
    const li = document.createElement("li");
    const stockLabel = c.stock > 0 ? `${c.stock} em estoque` : "Sem estoque";
    const stockTag = c.stock > 0 ? "" : `<span class="tag tag--danger">${stockLabel}</span>`;

    li.innerHTML = `
      <div>
        <div>${c.seller}</div>
        ${c.stock > 0 ? `<span class="panel__hint">${stockLabel}</span>` : stockTag}
      </div>
      <span class="competitor-list__price">${formatCurrency(c.price)}</span>
    `;
    list.appendChild(li);
  });
}

/**
 * Carrega o produto selecionado e atualiza gráfico + lista.
 */
function loadSelectedCompetitorProduct() {
  const select = document.getElementById("competitorProductSelect");
  const accountId = getCurrentAccountId();
  const accountData = MOCK_COMPETITOR_DATA[accountId];

  if (!accountData || !select.value) return;

  const product = accountData.products.find((p) => p.id === select.value);
  if (!product) return;

  renderPriceHistoryChart(product);
  renderCompetitorList(product);
}

/**
 * Inicializa a view de concorrentes.
 */
function initCompetitors() {
  populateCompetitorProductSelect();
  loadSelectedCompetitorProduct();

  document.getElementById("competitorProductSelect").addEventListener("change", loadSelectedCompetitorProduct);

  // Quando troca de conta: repopula o seletor e recarrega o gráfico
  document.addEventListener("accountChanged", () => {
    populateCompetitorProductSelect();
    loadSelectedCompetitorProduct();
  });
}
