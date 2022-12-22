import { Sequelize } from "sequelize-typescript";
import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import OrderItem from "../../domain/entity/order_item";
import Product from "../../domain/entity/product";
import CustomerModel from "../db/sequelize/model/customer.model";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";
import ProductModel from "../db/sequelize/model/product.model";
import CustomerRepository from "./customer.repository";
import ProductRepository from "./product.repository";
import Order from "../../domain/entity/order";
import OrderRepository from "./order.repository";
import { faker } from '@faker-js/faker';

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.id,
      product.price,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    const item1 = await createOrderItem();
    const order = await createOrder(faker.datatype.uuid(), [item1]);
    const orderRepository = new OrderRepository();
    
    const item2 = await createOrderItem();
    order.items.push(item2);

    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });
    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: item1.id,
          name: item1.name,
          price: item1.price,
          quantity: item1.quantity,
          order_id: order.id,
          product_id: item1.productId,
        },
        {
          id: item2.id,
          name: item2.name,
          price: item2.price,
          quantity: item2.quantity,
          order_id: order.id,
          product_id: item2.productId,
        },
      ]
    });

  });

  it("should find an order", async () => {
    const item1 = await createOrderItem();
    const order = await createOrder(faker.datatype.uuid(), [item1]);
    const orderRepository = new OrderRepository();
    const orderModel = await orderRepository.find(order.id);

    expect(orderModel).toStrictEqual(order);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find(faker.datatype.uuid());
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const item1 = await createOrderItem();
    const item2 = await createOrderItem();
    const order1 = await createOrder(faker.datatype.uuid(), [item1]);
    const order2 = await createOrder(faker.datatype.uuid(), [item2]);
    const orderRepository = new OrderRepository();

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });

  const createOrder = async (orderId: string, items: OrderItem[]) => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer(faker.datatype.uuid(), faker.internet.userName());
    const address = new Address(faker.address.streetName(), faker.datatype.number(), faker.address.zipCode(), faker.address.cityName());
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const order = new Order(orderId, customer.id, items);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    return order;
  };

  const createOrderItem = async () => {
    const productRepository = new ProductRepository();
    const product = new Product(faker.datatype.uuid(), faker.random.alpha(15), faker.datatype.number());
    await productRepository.create(product);

    return new OrderItem(
      faker.datatype.uuid(),
      product.name,
      product.id,
      product.price,
      1
    );
  };
});