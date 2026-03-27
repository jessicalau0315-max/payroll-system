// payrollSystem.js

class JobPosition {
    constructor(title, salary) {
        this.title = title;
        this.salary = salary;
    }
}

class Employee {
    constructor(name, jobPosition) {
        this.name = name;
        this.jobPosition = jobPosition;
        this.workHours = 0;
    }

    logHours(hours) {
        this.workHours += hours;
    }

    calculatePay() {
        return (this.workHours / 40) * this.jobPosition.salary;
    }

    resetWorkHours() {
        this.workHours = 0;
    }
}

class Payroll {
    constructor() {
        this.employees = [];
    }

    addEmployee(employee) {
        this.employees.push(employee);
    }

    calculateTotalPayroll() {
        return this.employees.reduce((total, employee) => {
            return total + employee.calculatePay();
        }, 0);
    }

    generatePayrollReport() {
        return this.employees.map(employee => ({
            name: employee.name,
            pay: employee.calculatePay(),
            workHours: employee.workHours
        }));
    }
}

// Example Usage
const developer = new JobPosition('Developer', 60000);
const manager = new JobPosition('Manager', 80000);

const employee1 = new Employee('Alice', developer);
const employee2 = new Employee('Bob', manager);

employee1.logHours(40);
employee2.logHours(50);

const payroll = new Payroll();
payroll.addEmployee(employee1);
payroll.addEmployee(employee2);

console.log(`Total Payroll: $${payroll.calculateTotalPayroll()}`);
console.log(payroll.generatePayrollReport());