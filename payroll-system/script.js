// payroll-system/script.js

// ── State ──────────────────────────────────────────────────────────────────────
const state = {
    positions: [],       // { name, hourlyRate }
    employees: [],       // { id, name, positionName }
    payrollRules: { overtimeRate: 1.5, attendanceBonus: 500 },
    workHours: {},       // { employeeId: hoursWorked }
    payrollRecords: [],  // { employeeName, positionName, hoursWorked, basePay, overtimePay, bonus, totalPay }
    nextEmployeeId: 1,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getPosition(name) {
    return state.positions.find(p => p.name === name);
}

function getEmployee(id) {
    return state.employees.find(e => e.id === id);
}

function refreshEmployeeSelects() {
    const selects = ['emp-select', 'calc-emp'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Select Employee --</option>';
        state.employees.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.id;
            opt.textContent = emp.name;
            select.appendChild(opt);
        });
        if (currentValue) select.value = currentValue;
    });
}

function refreshPositionSelect() {
    const select = document.getElementById('emp-position');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Select Position --</option>';
    state.positions.forEach(pos => {
        const opt = document.createElement('option');
        opt.value = pos.name;
        opt.textContent = `${pos.name} ($${pos.hourlyRate.toFixed(2)}/hr)`;
        select.appendChild(opt);
    });
    if (currentValue) select.value = currentValue;
}

// ── Job Positions ──────────────────────────────────────────────────────────────
function setupJobPositions() {
    const form = document.getElementById('job-position-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('position').value.trim();
        const hourlyRate = parseFloat(document.getElementById('hourly-rate').value);

        if (!name || isNaN(hourlyRate) || hourlyRate < 0) {
            alert('Please enter a valid position name and a non-negative hourly rate.');
            return;
        }
        if (state.positions.find(p => p.name === name)) {
            alert(`Position "${name}" already exists.`);
            return;
        }

        state.positions.push({ name, hourlyRate });
        renderPositionTable();
        refreshPositionSelect();
        form.reset();
    });
}

function renderPositionTable() {
    const tbody = document.querySelector('#position-table tbody');
    tbody.innerHTML = '';
    state.positions.forEach((pos, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pos.name}</td>
            <td>$${pos.hourlyRate.toFixed(2)}</td>
            <td><button class="btn-delete" data-idx="${idx}">Delete</button></td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            const inUse = state.employees.some(e => e.positionName === pos.name);
            if (inUse) {
                alert(`Cannot delete "${pos.name}" – it is assigned to one or more employees.`);
                return;
            }
            state.positions.splice(idx, 1);
            renderPositionTable();
            refreshPositionSelect();
        });
        tbody.appendChild(tr);
    });
}

// ── Employee Management ────────────────────────────────────────────────────────
function setupEmployeeManagement() {
    const form = document.getElementById('employee-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('emp-name').value.trim();
        const positionName = document.getElementById('emp-position').value;

        if (!name || !positionName) {
            alert('Please enter an employee name and select a job position.');
            return;
        }

        const employee = { id: state.nextEmployeeId++, name, positionName };
        state.employees.push(employee);
        renderEmployeeTable();
        refreshEmployeeSelects();
        form.reset();
    });
}

function renderEmployeeTable() {
    const tbody = document.querySelector('#employee-table tbody');
    tbody.innerHTML = '';
    state.employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.positionName}</td>
            <td><button class="btn-delete" data-id="${emp.id}">Delete</button></td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            state.employees = state.employees.filter(e => e.id !== emp.id);
            delete state.workHours[emp.id];
            renderEmployeeTable();
            refreshEmployeeSelects();
        });
        tbody.appendChild(tr);
    });
}

// ── Payroll Rules ──────────────────────────────────────────────────────────────
function setupPayrollRules() {
    const form = document.getElementById('payroll-rules-form');

    // Make fields editable
    document.getElementById('overtime-rate').removeAttribute('readonly');
    document.getElementById('attendance-bonus').removeAttribute('readonly');

    form.addEventListener('submit', e => {
        e.preventDefault();
        const overtimeRate = parseFloat(document.getElementById('overtime-rate').value);
        const attendanceBonus = parseFloat(document.getElementById('attendance-bonus').value);
        if (isNaN(overtimeRate) || isNaN(attendanceBonus)) {
            alert('Please enter valid numeric values for overtime rate and attendance bonus.');
            return;
        }
        state.payrollRules = { overtimeRate, attendanceBonus };
        alert('Payroll rules saved successfully.');
    });
}

// ── Work Time Input ────────────────────────────────────────────────────────────
function setupWorkTime() {
    const form = document.getElementById('work-time-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const empId = parseInt(document.getElementById('emp-select').value, 10);
        const hours = parseFloat(document.getElementById('hours-worked').value);
        if (!empId || isNaN(hours) || hours < 0) {
            alert('Please select an employee and enter valid (non-negative) hours worked.');
            return;
        }

        state.workHours[empId] = hours;
        const emp = getEmployee(empId);
        alert(`Recorded ${hours} hours for ${emp.name}.`);
        form.reset();
    });

    document.getElementById('excel-upload').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.addEventListener('change', handleFileUpload);
        input.click();
    });
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        let imported = 0;
        // Expected CSV format: EmployeeName,HoursWorked
        lines.forEach((line, idx) => {
            if (idx === 0 && line.toLowerCase().includes('name')) return; // skip header
            const parts = line.split(',');
            if (parts.length < 2) return;
            const name = parts[0].trim();
            const hours = parseFloat(parts[1].trim());
            if (!name || isNaN(hours)) return;
            const emp = state.employees.find(e => e.name.toLowerCase() === name.toLowerCase());
            if (emp) {
                state.workHours[emp.id] = hours;
                imported++;
            }
        });
        alert(`Imported work hours for ${imported} employee(s).`);
    };
    reader.readAsText(file);
}

// ── Payroll Calculation ────────────────────────────────────────────────────────
function setupPayrollCalculation() {
    const form = document.getElementById('payroll-calc-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const empId = parseInt(document.getElementById('calc-emp').value, 10);
        if (!empId) return;

        const result = calculatePayrollForEmployee(empId);
        if (!result) return;

        // Store record
        const existing = state.payrollRecords.findIndex(r => r.employeeId === empId);
        if (existing >= 0) state.payrollRecords.splice(existing, 1);
        state.payrollRecords.push(result);
        renderPayrollResult(result);
        renderPayrollRecords();
    });
}

function calculatePayrollForEmployee(empId) {
    const emp = getEmployee(empId);
    if (!emp) return null;

    const pos = getPosition(emp.positionName);
    if (!pos) return null;

    const hoursWorked = state.workHours[empId] || 0;
    const standardHours = 40;
    const { overtimeRate, attendanceBonus } = state.payrollRules;

    const regularHours = Math.min(hoursWorked, standardHours);
    const overtimeHours = Math.max(hoursWorked - standardHours, 0);
    const basePay = regularHours * pos.hourlyRate;
    const overtimePay = overtimeHours * pos.hourlyRate * overtimeRate;
    const bonus = hoursWorked >= standardHours ? attendanceBonus : 0;
    const totalPay = basePay + overtimePay + bonus;

    return {
        employeeId: empId,
        employeeName: emp.name,
        positionName: emp.positionName,
        hoursWorked,
        basePay,
        overtimePay,
        bonus,
        totalPay,
    };
}

function renderPayrollResult(result) {
    const div = document.getElementById('payroll-result');
    div.innerHTML = `
        <h3>Payroll Result for ${result.employeeName}</h3>
        <table class="result-table">
            <tr><th>Position</th><td>${result.positionName}</td></tr>
            <tr><th>Hours Worked</th><td>${result.hoursWorked}</td></tr>
            <tr><th>Base Pay</th><td>$${result.basePay.toFixed(2)}</td></tr>
            <tr><th>Overtime Pay</th><td>$${result.overtimePay.toFixed(2)}</td></tr>
            <tr><th>Attendance Bonus</th><td>$${result.bonus.toFixed(2)}</td></tr>
            <tr class="total-row"><th>Total Pay</th><td>$${result.totalPay.toFixed(2)}</td></tr>
        </table>
    `;
}

// ── Payroll Records ────────────────────────────────────────────────────────────
function renderPayrollRecords() {
    const tbody = document.querySelector('#payroll-table tbody');
    tbody.innerHTML = '';
    state.payrollRecords.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.employeeName}</td>
            <td>$${record.totalPay.toFixed(2)}</td>
            <td>
                <button class="btn-delete" data-id="${record.employeeId}">Remove</button>
            </td>
        `;
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            state.payrollRecords = state.payrollRecords.filter(r => r.employeeId !== record.employeeId);
            renderPayrollRecords();
        });
        tbody.appendChild(tr);
    });
}

function setupDownloadRecords() {
    document.getElementById('download-records').addEventListener('click', () => {
        if (state.payrollRecords.length === 0) {
            alert('No payroll records to download.');
            return;
        }
        const headers = ['Employee Name', 'Position', 'Hours Worked', 'Base Pay', 'Overtime Pay', 'Attendance Bonus', 'Total Pay'];
        const rows = state.payrollRecords.map(r => [
            r.employeeName,
            r.positionName,
            r.hoursWorked,
            r.basePay.toFixed(2),
            r.overtimePay.toFixed(2),
            r.bonus.toFixed(2),
            r.totalPay.toFixed(2),
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payroll-records.csv';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// ── Bootstrap ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupJobPositions();
    setupEmployeeManagement();
    setupPayrollRules();
    setupWorkTime();
    setupPayrollCalculation();
    setupDownloadRecords();
});
