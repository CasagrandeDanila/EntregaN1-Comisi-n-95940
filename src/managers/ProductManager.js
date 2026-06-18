import fs from 'fs/promises';
import crypto from 'crypto';

export class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === id) || null;
    }

    async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        if (!title || !description || !code || !price || stock === undefined || !category) {
            throw new Error("Todos los campos son obligatorios, excepto thumbnails.");
        }

        const products = await this.getProducts();
        if (products.some(p => p.code === code)) throw new Error("El código del producto ya existe.");

        const newProduct = {
            id: crypto.randomUUID(),
            title, description, code, price, status, stock, category, thumbnails
        };

        products.push(newProduct);
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async updateProduct(id, updateData) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        
        const { id: _, ...rest } = updateData; 
        products[index] = { ...products[index], ...rest };

        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        if (products.length === filtered.length) return false;

        await fs.writeFile(this.path, JSON.stringify(filtered, null, 2));
        return true;
    }
}