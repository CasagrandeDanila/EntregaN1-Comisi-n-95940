import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = query;
            }
        }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const result = await ProductModel.paginate(filter, options);

        const buildLink = (pageNumber) => {
            if (!pageNumber) return null;
            let link = `/api/products?limit=${options.limit}&page=${pageNumber}`;
            if (sort) link += `&sort=${sort}`;
            if (query) link += `&query=${query}`;
            return link;
        };

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: buildLink(result.prevPage),
            nextLink: buildLink(result.nextPage)
        });

    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await ProductModel.create(req.body);
        
        const io = req.app.get('socketio');
        const products = await ProductModel.find().lean();
        io.emit('updateProducts', products);
        
        res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const updated = await ProductModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ status: "success", payload: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const deleted = await ProductModel.findByIdAndDelete(req.params.pid);
        if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
        
        const io = req.app.get('socketio');
        const products = await ProductModel.find().lean();
        io.emit('updateProducts', products);
        
        res.json({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;