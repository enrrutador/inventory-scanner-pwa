// 1. Inicializar Base de Datos Local con Dexie
const db = new Dexie("PDA_InventoryDB");
db.version(1).stores({
    productos: '++id, sku, nombre, cantidad, fecha'
});

// 2. Configurar Escáner de Alta Velocidad
const html5QrCode = new Html5Qrcode("reader");
const config = { fps: 20, qrbox: { width: 250, height: 150 } };

const onScanSuccess = (decodedText) => {
    document.getElementById('codeInput').value = decodedText;
    vibrar(100);
    agregarProducto(decodedText);
};

// Función para vibración (Feedback PDA)
function vibrar(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

// 3. Lógica de Inventario
async function agregarProducto(skuManual = null) {
    const sku = skuManual || document.getElementById('codeInput').value;
    if (!sku) return;

    // Buscamos si ya existe el producto
    const existe = await db.productos.where("sku").equals(sku).first();

    if (existe) {
        await db.productos.update(existe.id, { cantidad: existe.cantidad + 1 });
    } else {
        await db.productos.add({
            sku: sku,
            nombre: "Producto Escaneado",
            cantidad: 1,
            fecha: new Date().toLocaleString()
        });
    }

    document.getElementById('codeInput').value = "";
    renderLista();
}

// 4. Renderizar Lista en Pantalla
async function renderLista() {
    const productos = await db.productos.toArray();
    const listContainer = document.getElementById('inventoryList');
    document.getElementById('stockCount').innerText = `${productos.length} ítems`;
    
    listContainer.innerHTML = productos.reverse().map(p => `
        <li class="product-item">
            <div class="product-info">
                <h4>${p.sku}</h4>
                <small>${p.fecha}</small>
            </div>
            <div class="stock-controls">
                <strong>${p.cantidad} u.</strong>
                <button onclick="borrarProducto(${p.id})">🗑️</button>
            </div>
        </li>
    `).join('');
}

// 5. Exportar a Excel
document.getElementById('exportButton').addEventListener('click', async () => {
    const data = await db.productos.toArray();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.utils.writeFile(workbook, "Reporte_Inventario.xlsx");
});

// Borrar producto
async function borrarProducto(id) {
    await db.productos.delete(id);
    renderLista();
}

// Iniciar Escáner y Lista al cargar
document.getElementById('addButton').addEventListener('click', () => agregarProducto());
html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess);
renderLista();
