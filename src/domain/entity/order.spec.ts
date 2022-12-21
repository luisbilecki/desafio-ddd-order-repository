import Order from "./order";
import OrderItem from "./order_item";

describe("Order unit tests", () => {

    it("should throw error when id is empty", () => {
        
        expect(() => {
            new Order("", "123", []);
        }).toThrowError("Id is required");
    })

    it("should throw error when customer id is empty", () => {
        
        expect(() => {
            new Order("1", "", []);
        }).toThrowError("Customer Id is required");
    })

    it("should throw error when order has items", () => {
        
        expect(() => {
            new Order("1", "222", []);
        }).toThrowError("Items are required");
    })

    it("should throw error when order has item with quantity zero", () => {
        const item1 = new OrderItem("i1", "n1", "p1", 10, 1);
        const item2 = new OrderItem("i1", "n1", "p2", 50, 0);

        expect(() => {
            new Order("o1", "c1", [item1, item2]);
        }).toThrowError("Quantity must be greater than 0");
    })

    it("should calculate total", () => {
        const item1 = new OrderItem("i1", "n1", "p1", 10, 1);
        const item2 = new OrderItem("i1", "n2", "p2", 50, 2);
        const order1 = new Order("o1", "c1", [item1]);
        let total = order1.total();
        
        expect(total).toBe(10);

        const order2 = new Order("o2", "c1", [item1, item2]);
        total = order2.total();
        
        expect(total).toBe(110);
    })
});