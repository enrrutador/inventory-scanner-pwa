const scanBtn = document.getElementById("scanBtn");
const input = document.getElementById("barcodeInput");
const nameEl = document.getElementById("productName");
const stockEl = document.getElementById("productStock");

scanBtn.addEventListener("click", () => {
  const code = input.value.trim();

  if (code === "") {
    alert("Ingresá un código");
    return;
  }

  // Simulación de base de datos
  const fakeDB = {
    "123": { name: "Producto A", stock: 10 },
    "456": { name: "Producto B", stock: 2 },
    "789": { name: "Producto C", stock: 0 },
  };

  const product = fakeDB[code];

  if (!product) {
    nameEl.textContent = "Producto no encontrado";
    stockEl.textContent = "";
    return;
  }

  nameEl.textContent = `Nombre: ${product.name}`;
  stockEl.textContent = `Stock: ${product.stock}`;
});
