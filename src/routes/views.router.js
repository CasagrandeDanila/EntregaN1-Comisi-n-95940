import { Router } from "express";
import { ProductManager } from "../managers/ProductManager";

const router = Router();
const productManager = new ProductManager('./src/data/products.json');

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    const plainProducts = JSON.parse(JSON.stringify(products));
    res.render('home', { products: plainProducts, title: "Home - Productos"});
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: "Productos en Tiempo Real"});
});

export default router;