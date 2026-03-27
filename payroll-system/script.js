class PayrollSystem {
    constructor() {
        this.employees = [];
    }

    addEmployee(employee) {
        this.employees.push(employee);
    }

    calculatePayroll() {
        return this.employees.reduce((total, employee) => total + employee.salary, 0);
    }

    getEmployeeDetails() {
        return this.employees;
    }
}

class UIManager {
    constructor(payrollSystem) {
        this.payrollSystem = payrollSystem;
    }

    displayEmployees() {
        const employeeList = this.payrollSystem.getEmployeeDetails();
        employeeList.forEach(emp => {
            console.log(`Name: ${emp.name}, Salary: ${emp.salary}`);
        });
    }

    addEmployeeForm(name, salary) {
        this.payrollSystem.addEmployee({ name, salary });
        console.log(`Added Employee: ${name}`);
    }

    displayTotalPayroll() {
        const total = this.payrollSystem.calculatePayroll();
        console.log(`Total Payroll: ${total}`);
    }
}

// Example usage:
const payroll = new PayrollSystem();
const ui = new UIManager(payroll);

ui.addEmployeeForm('John Doe', 50000);
ui.addEmployeeForm('Jane Smith', 60000);
ui.displayEmployees();
ui.displayTotalPayroll();