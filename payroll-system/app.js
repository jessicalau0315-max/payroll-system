// payroll-system/app.js

class Employee {
    constructor(name, position, hoursWorked) {
        this.name = name;
        this.position = position;
        this.hoursWorked = hoursWorked;
    }
}

class PayrollSystem {
    constructor() {
        this.employees = [];
        this.payrollRules = {};
    }

    addEmployee(employee) {
        this.employees.push(employee);
    }

    setPayrollRule(position, hourlyWage) {
        this.payrollRules[position] = hourlyWage;
    }

    calculatePayroll() {
        const payrollRecords = this.employees.map(employee => {
            const wage = this.payrollRules[employee.position] || 0;
            const totalPay = wage * employee.hoursWorked;
            return {
                name: employee.name,
                position: employee.position,
                totalPay: totalPay,
            };
        });
        return payrollRecords;
    }

    displayPayroll() {
        const records = this.calculatePayroll();
        records.forEach(record => {
            console.log(`Name: ${record.name}, Position: ${record.position}, Total Pay: $${record.totalPay.toFixed(2)}`);
        });
    }
}

// Sample Usage
const payroll = new PayrollSystem();

payroll.setPayrollRule('Developer', 50);
payroll.setPayrollRule('Designer', 40);

payroll.addEmployee(new Employee('Alice', 'Developer', 160));
payroll.addEmployee(new Employee('Bob', 'Designer', 150));

payroll.displayPayroll();
