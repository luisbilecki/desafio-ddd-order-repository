import Address from "./address";
import Customer from "./customer";

describe("Customer unit tests", () => {

    it("should throw error when id is empty", () => {
        expect(() => {
            let customer = new Customer("", "John")
        }).toThrowError("ID is required");
    });

    it("should throw error when name is empty", () => {
        expect(() => {
            let customer = new Customer("123", "")
        }).toThrowError("Name is required");
    });

    it("should change name", () => {
        // Arrange
        const customer = new Customer("123", "Luis");

        // Act
        customer.changeName("Felipe");

        // Assert
        expect(customer.name).toBe("Felipe")
    });

    it("should throw error when address is undefined when you activate a customer", () => {
        expect(() => {        
            const customer = new Customer("123", "Luis");
            customer.activate();
        }).toThrowError("Address is mandatory to activate a customer");
    });

    it("should activate customer", () => {
        const customer = new Customer("123", "Luis");
        const address = new Address("Street 1", 123, "13330-250", "São Paulo");
        customer.Address = address;

        customer.activate();
        expect(customer.isActive()).toBe(true);
    });

    it("should deactivate customer", () => {
        const customer = new Customer("123", "Luis");

        customer.deactivate();
        expect(customer.isActive()).toBe(false);
    });

    it("should add reward points", () => {
        const customer = new Customer("123", "Luis");
        expect(customer.rewardPoints).toBe(0);

        customer.addRewardPoints(10);
        expect(customer.rewardPoints).toBe(10);

        customer.addRewardPoints(10);
        expect(customer.rewardPoints).toBe(20);
    });
});