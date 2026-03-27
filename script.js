class PayrollSystem {
    constructor() {
        this.employees = [];
        this.jobPositions = {};
        this.payrollRules = {};
        this.attendanceRecords = {};
        this.payrollRecords = [];
    }

    addEmployee(employee) {
        this.employees.push(employee);
    }

    setJobPosition(employeeId, position, salary) {
        this.jobPositions[employeeId] = { position, salary };
    }

    configurePayrollRules(rules) {
        this.payrollRules = rules;
    }

    trackWorkHours(employeeId, hoursWorked) {
        this.attendanceRecords[employeeId] = hoursWorked;
    }

    calculatePayroll(employeeId) {
        const hoursWorked = this.attendanceRecords[employeeId] || 0;
        const { salary } = this.jobPositions[employeeId] || {};
        const overtime = hoursWorked > 40 ? (hoursWorked - 40) * (salary / 40) * 1.5 : 0;
        const totalPay = (salary / 40) * hoursWorked + overtime + this.calculateBonuses(employeeId);
        this.payrollRecords.push({ employeeId, totalPay });
        return totalPay;
    }

    calculateBonuses(employeeId) {
        // Placeholder for attendance bonus logic
        return 0;
    }
}

class UIManager {
    constructor() {
        this.init();
    }

    init() {
        const calculateButton = document.getElementById('calculateButton');
        calculateButton.addEventListener('click', () => this.handleCalculate());
    }

    handleCalculate() {
        const employeeId = document.getElementById('employeeId').value;
        const payrollSystem = new PayrollSystem();
        const totalPay = payrollSystem.calculatePayroll(employeeId);
        alert(`Total Pay for Employee ${employeeId}: $${totalPay}`);
    }
}

// Initialize UIManager and PayrollSystem
new UIManager();