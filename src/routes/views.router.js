import { Router } from "express";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const products = await ProductModel.find().lean();
        res.render('home', { products, title: "Home - Productos" });
    } catch (error) {
        res.status(500).send("Error al cargar los productos");
    }
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: "Productos en Tiempo Real" });
});

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const result = await ProductModel.paginate({}, { limit: parseInt(limit), page: parseInt(page), lean: true });

        res.render('index', { 
            products: result.docs, 
            pagination: result,
            title: "Lista de Productos"
        });
    } catch (error) {
        res.status(500).send("Error al cargar la paginación");
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid).populate('products.product').lean();
        res.render('cart', { cart, title: "Carrito de Compras" });
    } catch (error) {
        res.status(500).send("Error al cargar el carrito");
    }
});

export default router;