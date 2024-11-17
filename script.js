document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcome-screen");
  const screen1 = document.getElementById("screen1");
  const screen2 = document.getElementById("screen2");
  const screen3 = document.getElementById("screen3");
  const stockForm = document.getElementById("stock-entry-form");
  const salesForm = document.getElementById("sales-entry-form");
  const refreshStockButton = document.getElementById("refresh-stock");
  const refreshReportButton = document.getElementById("refresh-report");
  const reportButton = document.getElementById("generate-report");
  const stockOutput = document.getElementById("stock-output");
  const reportOutput = document.getElementById("report-output");
  const toScreen2Button = document.getElementById("toScreen2");
  const toScreen3Button = document.getElementById("toScreen3");
  const backToScreen1Button = document.getElementById("backToScreen1");
  const backToScreen2Button = document.getElementById("backToScreen2");

  function showScreen(screen) {
    welcomeScreen.style.display = "none";
    screen1.style.display = "none";
    screen2.style.display = "none";
    screen3.style.display = "none";
    screen.style.display = "block";
  }

  setTimeout(() => {
    showScreen(screen1);
  }, 3000);

  function addStock(item, quantity, price) {
    const stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    const existingStock = stocks.find((stock) => stock.item === item);
    if (existingStock) {
      existingStock.quantity += quantity;
      existingStock.price = price;
    } else {
      stocks.push({ item, quantity, price });
    }
    localStorage.setItem("stocks", JSON.stringify(stocks));
    fetchStock();
  }

  function fetchStock() {
    const stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    stockOutput.innerHTML = "";
    if (stocks.length === 0) {
      stockOutput.innerHTML = "<p>No stocks available</p>";
    } else {
      const stockList = document.createElement("ul");
      stocks.forEach((stock) => {
        const stockItem = document.createElement("li");
        stockItem.textContent = `${stock.item}: ${
          stock.quantity
        } units @ Ksh ${stock.price.toFixed(2)} each`;
        const clearButton = createClearButton(stock.item);
        stockItem.appendChild(clearButton);
        stockList.appendChild(stockItem);
      });
      stockOutput.appendChild(stockList);
    }
  }

  function createClearButton(item) {
    const button = document.createElement("button");
    button.textContent = "Clear Entry";
    button.addEventListener("click", () => {
      clearEntry(item);
    });
    return button;
  }

  function clearEntry(item) {
    const stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    const updatedStocks = stocks.filter((stock) => stock.item !== item);
    localStorage.setItem("stocks", JSON.stringify(updatedStocks));
    fetchStock();
  }

  function recordSale(saleItem, saleQuantity) {
    const sales = JSON.parse(localStorage.getItem("sales")) || [];
    sales.push({ saleItem, saleQuantity });
    localStorage.setItem("sales", JSON.stringify(sales));

    // Deduct from stock
    const stocks = JSON.parse(localStorage.getItem("stocks")) || [];
    const stockItem = stocks.find((stock) => stock.item === saleItem);
    if (stockItem) {
      stockItem.quantity -= saleQuantity;
      if (stockItem.quantity < 0) stockItem.quantity = 0;
      localStorage.setItem("stocks", JSON.stringify(stocks));
    }

    fetchStock(); // Refresh stock display
  }

  function generateReport() {
    setTimeout(() => {
      const sales = JSON.parse(localStorage.getItem("sales")) || [];
      const stocks = JSON.parse(localStorage.getItem("stocks")) || [];
      let totalSalesUnits = 0;
      let totalSalesRevenue = 0;
      const suggestions = [];

      sales.forEach((sale) => {
        const stockItem = stocks.find((stock) => stock.item === sale.saleItem);
        if (stockItem) {
          totalSalesUnits += sale.saleQuantity;
          totalSalesRevenue += sale.saleQuantity * stockItem.price;
        }
      });

      stocks.forEach((stock) => {
        const totalSalesForItem = sales
          .filter((sale) => sale.saleItem === stock.item)
          .reduce((total, sale) => total + sale.saleQuantity, 0);
        if (stock.quantity < 10 || totalSalesForItem > 50) {
          const reason =
            stock.quantity < 10 ? "Low stock level" : "High sales volume";
          suggestions.push(`Increase ${stock.item}: ${reason}`);
        } else if (totalSalesForItem < 10) {
          suggestions.push(`Decrease ${stock.item}: Low sales volume`);
        }
      });

      reportOutput.innerHTML = `<p>Total Sales: ${totalSalesUnits} units</p>`;
      reportOutput.innerHTML += `<p>Total Revenue: Ksh ${totalSalesRevenue.toFixed(
        2
      )}</p>`;
      reportOutput.innerHTML += `<p>Suggestions for next stock purchase:</p>`;
      reportOutput.innerHTML += `<ul>${suggestions
        .map((suggestion) => `<li>${suggestion}</li>`)
        .join("")}</ul>`;
    }, 1000);
  }

  stockForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const item = document.getElementById("item").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);
    addStock(item, quantity, price);
    this.reset();
  });

  salesForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const saleItem = document.getElementById("sale-item").value;
    const saleQuantity = parseInt(
      document.getElementById("sale-quantity").value
    );
    recordSale(saleItem, saleQuantity);
    generateReport(); // Generate report after recording sale
    this.reset();
  });

  refreshStockButton.addEventListener("click", function () {
    fetchStock();
  });

  reportButton.addEventListener("click", function () {
    generateReport();
  });

  refreshReportButton.addEventListener("click", function () {
    generateReport();
  });

  // Event listeners for screen navigation buttons
  toScreen2Button.addEventListener("click", function () {
    showScreen(screen2);
  });

  toScreen3Button.addEventListener("click", function () {
    showScreen(screen3);
  });

  backToScreen1Button.addEventListener("click", function () {
    showScreen(screen1);
  });

  backToScreen2Button.addEventListener("click", function () {
    showScreen(screen2);
  });

  // Initial screen display
  showScreen(welcomeScreen);
});
