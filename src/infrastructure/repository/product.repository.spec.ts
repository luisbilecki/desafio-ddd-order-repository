import { Sequelize } from "sequelize-typescript";
import ProductModel from "../db/sequelize/model/product.model";
import Product from "../../domain/entity/product";
import ProductRepository from "./product.repository";

describe("Product repository test", () => {

    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            sync: { force: true },
        });
        sequelize.addModels([ProductModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should create a product", async () => {
        const repository = new ProductRepository();
        const product = new Product("1", "Product 1", 100);
        await repository.create(product);

        const productModel = await ProductModel.findOne({ where: { id: "1" }});

        expect(productModel.toJSON()).toStrictEqual({
            id: "1",
            name: "Product 1",
            price: 100,
        });
    });

    it("should update a product", async () => {
        const repository = new ProductRepository();
        const product = new Product("1", "Product 1", 100);
        await repository.create(product);

        const productModel = await ProductModel.findOne({ where: { id: "1" }});

        expect(productModel.toJSON()).toStrictEqual({
            id: "1",
            name: "Product 1",
            price: 100,
        });
        
        product.changeName("Product 2");
        product.changePrice(200);

        await repository.update(product); 
        
        const productModel2 = await ProductModel.findOne({ where: { id: "1" }});

        expect(productModel2.toJSON()).toStrictEqual({
            id: "1",
            name: "Product 2",
            price: 200,
        });
    });

    it("should find a product", async () => {
        const repository = new ProductRepository();
        const product = new Product("1", "Product 1", 100);
        await repository.create(product);

        const productModel = await ProductModel.findOne({ where: { id: "1" }});
        const foundProduct = await repository.find("1");
        expect(productModel.toJSON()).toStrictEqual({
            id: foundProduct.id,
            name: foundProduct.name,
            price: foundProduct.price,
        });
    });

    it("should find all products", async () => {
        const repository = new ProductRepository();
        const product1 = new Product("1", "Product 1", 100);
        await repository.create(product1);

        const product2 = new Product("2", "Product 2", 200);
        await repository.create(product2);

        const foundProducts = await repository.findAll();
        const products = [product1, product2];
        
        expect(products).toEqual(foundProducts);
    });
});