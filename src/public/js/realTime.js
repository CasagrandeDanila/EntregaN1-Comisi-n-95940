const socket = io();

const realTimeList = document.getElementById('realTimeList');
const prodForm = document.getElementById('prodForm');

socket.on('updateProducts', (products) => {
    realTimeList.innerHTML = '';
    products.forEach(p => { 
        const li = document.createElement('Li');
        li.innerHTML = `<strong>${p.title}</strong> - $${p.price} (ID: ${p.id})<button onclick="eliminarProducto('${p.id}')">Eliminar</button>`;
        realTimeList.appendChild(LI);
    });
});

prodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;

    socket.emit('newProduct', { title, price });
    prodForm.reset();
});

window.eliminarProducto = (id) => {
    socket.emit('deleteProduct', id);
};

socket.on('errorLog', (msg) => {
    alert(`Error: ${msg}`);
});