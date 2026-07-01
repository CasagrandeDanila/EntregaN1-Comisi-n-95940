import { ProductManager } from '../managers/ProductManager.js';
import { Router } from 'express';


const router = Router();
const productManager = new ProductManager('./src/data/products.json');

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.json({ status: "success", payload: products });
});

router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ status: "success", payload: product });
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        const io = req.app.get('socketio');
        const products = await productManager.getProducts();
        io.emit('updateProducts', products);
        res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    const updated = await productManager.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ status: "success", payload: updated });
});

router.delete('/:pid', async (req, res) => {
    const deleted = await productManager.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    const io = req.app.get('socketio');
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    res.json({ status: "success", message: "Producto eliminado correctamente" });
});

export default router;