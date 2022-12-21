import Customer from "../entity/customer";
import Order from "../entity/order";
import OrderItem from "../entity/order_item";
import OrderService from "./order.service";

describe("Order service unit tests", () => {

    it("should place an order", () => {

        const customer1 = new Customer("c1", "Customer 1");
        const item1 = new OrderItem("i1", "n1", "p1", 10, 1);

        const order = OrderService.placeOrder(customer1, [item1]);

        expect(customer1.rewardPoints).toBe(5);
        expect(order.total()).toBe(10);
    });

    it("should get total of all orders", () => {
    
        const item1 = new OrderItem("i1", "n1", "p1", 100, 1);
        const item2 = new OrderItem("i2", "n1", "p2", 200, 2);

        const order1 = new Order("o1", "c1", [item1]);
        const order2 = new Order("o2", "c2", [item2]);

        const total = OrderService.total([order1, order2]);
        
        expect(total).toBe(500)
    });
});