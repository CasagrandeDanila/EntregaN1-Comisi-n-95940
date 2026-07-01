import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import viewsRouter from './routes/views.router.js';
import { ProductManager } from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productManager = new ProductManager('./src/data/products.json');
const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.use('/', viewsRouter);

const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Servidor activo y escuchando en http://localhost:${PORT}`);
});

const io = new Server (httpServer);

app.set('socketio', io);

io.on('connection', async (socket) => {
    console.log('Cliente conectado: ${socket.id}');
    const products = await productManager.getProducts();
    socket.emit('updateProducts', products);
    socket.on('newProduct', async (prodData) =>{
        try {
            await productManager.addProduct(prodData);
            const updatedProducts = await productManager.getProducts();
            io.emit('updateProducts', updatedProducts);
        } catch (error) {
            socket.emit('errorLog', error.message);
        }
    });
    socket.on('deleteProduct', async (pid) => {
        try {
            await productManager.deleteProduct(pid);
            const updatedProducts = await productManager.getProducts();
            io.emit('updateProducts', updatedProducts);
        } catch (error) {
            socket.emit('errorLog', error.message);
        }
    });
});