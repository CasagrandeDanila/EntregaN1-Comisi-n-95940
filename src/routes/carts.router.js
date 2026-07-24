import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const newCart = await CartModel.create({ products: [] });
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }

        await cart.save();
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
        await cart.save();
        
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.products = req.body;
        await cart.save();

        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = req.body.quantity;
            await cart.save();
            res.json({ status: "success", payload: cart });
        } else {
            res.status(404).json({ error: "Producto no encontrado en el carrito" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.products = [];
        await cart.save();

        res.json({ status: "success", message: "Carrito vaciado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;