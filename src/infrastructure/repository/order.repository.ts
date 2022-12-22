import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/order_item";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";

export default class OrderRepository implements OrderRepositoryInterface  {

  readonly sequelize = OrderModel.sequelize

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const t = await this.sequelize.transaction();

    try {
      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction: t,
      });

      await entity.items.map(async (item) => {
        await OrderItemModel.create(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
            order_id: entity.id,
          },
          { transaction: t }
        );
      });

      await OrderModel.update(
        {
          total: entity.total(),
        },
        {
          where: { id: entity.id },
          transaction: t,
        }
      );

      await t.commit();
    } catch (error) {
      console.error(error);
      await t.rollback();
    }

  
  }

  async find(id: string): Promise<Order> {
    try {
      const order = await OrderModel.findOne({
        where: { id },
        include: [{ model: OrderItemModel }],
        rejectOnEmpty: true,
      });
      return this.toOrderEntity(order)
    } catch (error) {
      throw new Error("Order not found");
    }
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.findAll({
      include: [{ model: OrderItemModel }]
    })
    return orders.map(this.toOrderEntity)
  }

  private toOrderEntity(instance: OrderModel): Order {
    return new Order(
      instance.id,
      instance.customer_id,
      instance.items.map(
        (item) =>
          new OrderItem(
            item.id,
            item.name,
            item.product_id,
            item.price,
            item.quantity
          )
      )
    );
  }
}