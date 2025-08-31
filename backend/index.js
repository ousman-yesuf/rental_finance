const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Buildings
app.get('/buildings', async (req, res) => {
  const buildings = await prisma.building.findMany({
    include: { units: true, expenses: true, payrolls: true, audits: true }
  });
  res.json(buildings);
});

app.post('/buildings', async (req, res) => {
  const { name, address } = req.body;
  const building = await prisma.building.create({
    data: { name, address }
  });
  await prisma.audit.create({
    data: { buildingId: building.id, action: 'created building', userId: 1, details: `Name: ${name}` }
  });
  res.json(building);
});

// Rental Units
app.get('/units/:buildingId', async (req, res) => {
  const units = await prisma.rentalUnit.findMany({
    where: { buildingId: Number(req.params.buildingId) },
  });
  res.json(units);
});

app.post('/units', async (req, res) => {
  try {
    const { buildingId, unitNumber, tenantName, rentAmount, dueDate } = req.body;
    
    // Validate required fields
    if (!buildingId || !unitNumber || !rentAmount || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields: buildingId, unitNumber, rentAmount, and dueDate are required' });
    }

    // Validate buildingId exists
    const building = await prisma.building.findUnique({
      where: { id: Number(buildingId) },
    });
    if (!building) {
      return res.status(400).json({ error: 'Invalid buildingId: Building does not exist' });
    }

    const unit = await prisma.rentalUnit.create({
      data: {
        buildingId: Number(buildingId),
        unitNumber,
        tenantName: tenantName || null, // Allow null for tenantName
        rentAmount: Number(rentAmount),
        dueDate: new Date(dueDate),
      },
    });
    await prisma.audit.create({
      data: {
        buildingId: Number(buildingId),
        userId: 1,
        action: 'Created rental unit',
        timestamp: new Date(),
        details: `Unit ${unitNumber} created`,
      },
    });
    res.json(unit);
  } catch (error) {
    console.error('Error creating rental unit:', error);
    res.status(500).json({ error: error.message || 'Failed to create rental unit' });
  }
});

app.put('/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantName, rentAmount, dueDate } = req.body;
    const unit = await prisma.rentalUnit.update({
      where: { id: Number(id) },
      data: { 
        tenantName: tenantName || null,
        rentAmount: Number(rentAmount),
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    await prisma.audit.create({
      data: {
        buildingId: unit.buildingId,
        userId: 1,
        action: 'Updated rental unit',
        timestamp: new Date(),
        details: `Unit ${unit.unitNumber} updated`,
      },
    });
    res.json(unit);
  } catch (error) {
    console.error('Error updating rental unit:', error);
    res.status(500).json({ error: error.message || 'Failed to update rental unit' });
  }
});

app.delete('/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await prisma.rentalUnit.findUnique({ where: { id: Number(id) } });
    if (!unit) {
      return res.status(404).json({ error: 'Rental unit not found' });
    }
    await prisma.rentalUnit.delete({ where: { id: Number(id) } });
    await prisma.audit.create({
      data: {
        buildingId: unit.buildingId,
        userId: 1,
        action: 'Deleted rental unit',
        timestamp: new Date(),
        details: `Unit ${unit.unitNumber} deleted`,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting rental unit:', error);
    res.status(500).json({ error: error.message || 'Failed to delete rental unit' });
  }
});

// Payments
app.get('/payments/:rentalUnitId', async (req, res) => {
  try {
    const { rentalUnitId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { rentalUnitId: parseInt(rentalUnitId) }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payments' });
  }
});

app.post('/payments', async (req, res) => {
  try {
    const { rentalUnitId, amount, date, method, vat } = req.body;
    if (!rentalUnitId || !amount || !date || !method) {
      return res.status(400).json({ error: 'Missing required fields: rentalUnitId, amount, date, and method are required' });
    }
    const payment = await prisma.payment.create({
      data: { 
        rentalUnitId: Number(rentalUnitId), 
        amount: Number(amount), 
        date: new Date(date), 
        method, 
        vat: vat ? Number(vat) : Number(amount) * 0.15 
      }
    });
    const unit = await prisma.rentalUnit.findUnique({ where: { id: Number(rentalUnitId) } });
    await prisma.audit.create({
      data: { buildingId: unit.buildingId, action: 'added payment', userId: 1, details: `Amount: ${amount}` }
    });
    res.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
});

// Expenses
app.get('/expenses/:buildingId', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { buildingId: Number(req.params.buildingId) },
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch expenses' });
  }
});

app.post('/expenses', async (req, res) => {
  try {
    const { buildingId, description, amount, date, category, vat } = req.body;
    console.log('Received POST /expenses:', req.body);
    if (!buildingId || !description || !amount || !date || !category || vat === undefined) {
      return res.status(400).json({ error: 'Missing required fields: buildingId, description, amount, date, category, and vat are required' });
    }
    const building = await prisma.building.findUnique({
      where: { id: Number(buildingId) },
    });
    if (!building) {
      return res.status(400).json({ error: 'Invalid buildingId: Building does not exist' });
    }
    const expense = await prisma.expense.create({
      data: {
        buildingId: Number(buildingId),
        description,
        amount: Number(amount),
        date: new Date(date),
        category,
        vat: Number(vat),
      },
    });
    await prisma.audit.create({
      data: {
        buildingId: Number(buildingId),
        userId: 1,
        action: 'Created expense',
        timestamp: new Date(),
        details: `Description: ${description}`,
      },
    });
    res.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: error.message || 'Failed to create expense' });
  }
});

app.patch('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingId, description, amount, date, category, vat } = req.body;
    console.log('Received PATCH /expenses:', { id, ...req.body });
    if (!buildingId || !description || !amount || !date || !category || vat === undefined) {
      return res.status(400).json({ error: 'Missing required fields: buildingId, description, amount, date, category, and vat are required' });
    }
    const building = await prisma.building.findUnique({
      where: { id: Number(buildingId) },
    });
    if (!building) {
      return res.status(400).json({ error: 'Invalid buildingId: Building does not exist' });
    }
    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: {
        buildingId: Number(buildingId),
        description,
        amount: Number(amount),
        date: new Date(date),
        category,
        vat: Number(vat),
      },
    });
    await prisma.audit.create({
      data: {
        buildingId: Number(buildingId),
        userId: 1,
        action: 'Updated expense',
        timestamp: new Date(),
        details: `Description: ${description}`,
      },
    });
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: error.message || 'Failed to update expense' });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received DELETE /expenses:', id);
    const expense = await prisma.expense.findUnique({
      where: { id: Number(id) },
    });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    await prisma.expense.delete({
      where: { id: Number(id) },
    });
    await prisma.audit.create({
      data: {
        buildingId: expense.buildingId,
        userId: 1,
        action: 'Deleted expense',
        timestamp: new Date(),
        details: `Description: ${expense.description}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message || 'Failed to delete expense' });
  }
});

app.get('/payrolls/:buildingId', async (req, res) => {
  try {
    const buildingId = Number(req.params.buildingId);
    console.log('Received GET /payrolls:', buildingId);
    const payrolls = await prisma.payroll.findMany({
      where: { buildingId },
    });
    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payrolls' });
  }
});

app.post('/payrolls', async (req, res) => {
  try {
    const { buildingId, employeeName, salary, date, deductions, vat } = req.body;
    console.log('Received POST /payrolls:', req.body);
    if (!buildingId || !employeeName || !salary || !date || deductions === undefined || vat === undefined) {
      return res.status(400).json({ error: 'Missing required fields: buildingId, employeeName, salary, date, deductions, and vat are required' });
    }
    const building = await prisma.building.findUnique({
      where: { id: Number(buildingId) },
    });
    if (!building) {
      return res.status(400).json({ error: 'Invalid buildingId: Building does not exist' });
    }
    const payroll = await prisma.payroll.create({
      data: {
        buildingId: Number(buildingId),
        employeeName,
        salary: Number(salary),
        date: new Date(date),
        deductions: Number(deductions),
        vat: Number(vat),
      },
    });
    await prisma.audit.create({
      data: {
        buildingId: Number(buildingId),
        userId: 1,
        action: 'Created payroll',
        timestamp: new Date(),
        details: `Employee: ${employeeName}`,
      },
    });
    res.json(payroll);
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ error: error.message || 'Failed to create payroll' });
  }
});

app.patch('/payrolls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingId, employeeName, salary, date, deductions, vat } = req.body;
    console.log('Received PATCH /payrolls:', { id, ...req.body });
    if (!buildingId || !employeeName || !salary || !date || deductions === undefined || vat === undefined) {
      return res.status(400).json({ error: 'Missing required fields: buildingId, employeeName, salary, date, deductions, and vat are required' });
    }
    const building = await prisma.building.findUnique({
      where: { id: Number(buildingId) },
    });
    if (!building) {
      return res.status(400).json({ error: 'Invalid buildingId: Building does not exist' });
    }
    const payroll = await prisma.payroll.update({
      where: { id: Number(id) },
      data: {
        buildingId: Number(buildingId),
        employeeName,
        salary: Number(salary),
        date: new Date(date),
        deductions: Number(deductions),
        vat: Number(vat),
      },
    });
    await prisma.audit.create({
      data: {
        buildingId: Number(buildingId),
        userId: 1,
        action: 'Updated payroll',
        timestamp: new Date(),
        details: `Employee: ${employeeName}`,
      },
    });
    res.json(payroll);
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: error.message || 'Failed to update payroll' });
  }
});

app.delete('/payrolls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received DELETE /payrolls:', id);
    const payroll = await prisma.payroll.findUnique({
      where: { id: Number(id) },
    });
    if (!payroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }
    await prisma.payroll.delete({
      where: { id: Number(id) },
    });
    await prisma.audit.create({
      data: {
        buildingId: payroll.buildingId,
        userId: 1,
        action: 'Deleted payroll',
        timestamp: new Date(),
        details: `Employee: ${payroll.employeeName}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payroll:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payroll' });
  }
});



// Audits
app.get('/audits/:buildingId', async (req, res) => {
  try {
    const { buildingId } = req.params;
    const audits = await prisma.audit.findMany({
      where: { buildingId: parseInt(buildingId) },
      orderBy: { timestamp: 'desc' }
    });
    res.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch audits' });
  }
});

// Dashboard Summary
app.get('/summary/:buildingId', async (req, res) => {
  try {
    const { buildingId } = req.params;
    const bid = parseInt(buildingId);

    const totalRent = await prisma.payment.aggregate({
      where: { rentalUnit: { buildingId: bid } },
      _sum: { amount: true }
    });

    const totalExpenses = await prisma.expense.aggregate({
      where: { buildingId: bid },
      _sum: { amount: true }
    });

    const totalPayroll = await prisma.payroll.aggregate({
      where: { buildingId: bid },
      _sum: { salary: true }
    });

    const vatExpenses = await prisma.expense.aggregate({
      where: { buildingId: bid },
      _sum: { vat: true }
    });
    const vatPayrolls = await prisma.payroll.aggregate({
      where: { buildingId: bid },
      _sum: { vat: true }
    });
    const vatPayments = await prisma.payment.aggregate({
      where: { rentalUnit: { buildingId: bid } },
      _sum: { vat: true }
    });

    const totalVAT = (vatExpenses._sum.vat || 0) + (vatPayrolls._sum.vat || 0) + (vatPayments._sum.vat || 0);

    const units = await prisma.rentalUnit.findMany({
      where: { buildingId: bid },
      include: { payments: true }
    });
    const outstandingRent = units.reduce((acc, unit) => {
      const paid = unit.payments.reduce((sum, p) => sum + p.amount, 0);
      return acc + (unit.rentAmount - paid > 0 ? unit.rentAmount - paid : 0);
    }, 0);

    const numUnits = await prisma.rentalUnit.count({ where: { buildingId: bid } });
    const numTenants = await prisma.rentalUnit.count({ where: { buildingId: bid, tenantName: { not: null } } });

    res.json({
      totalRent: totalRent._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalPayroll: totalPayroll._sum.salary || 0,
      totalVAT,
      outstandingRent,
      numUnits,
      numTenants
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch summary' });
  }
});

// VAT Report
// VAT Report
app.get('/vat-report/:buildingId', async (req, res) => {
  try {
    const { buildingId } = req.params;
    const bid = parseInt(buildingId);
    console.log('Received GET /vat-report:', bid);

    const building = await prisma.building.findUnique({
      where: { id: bid },
    });
    if (!building) {
      return res.status(400).json({ error: 'Invalid buildingId: Building does not exist' });
    }

    const paymentsVAT = await prisma.payment.findMany({
      where: { rentalUnit: { buildingId: bid } },
      select: {
        id: true,
        amount: true,
        vat: true,
        date: true,
        rentalUnit: { select: { unitNumber: true } },
      },
    });

    const expensesVAT = await prisma.expense.findMany({
      where: { buildingId: bid },
      select: { id: true, description: true, amount: true, vat: true, date: true },
    });

    const payrollsVAT = await prisma.payroll.findMany({
      where: { buildingId: bid },
      select: { id: true, employeeName: true, salary: true, vat: true, date: true },
    });

    const totalVAT =
      expensesVAT.reduce((sum, e) => sum + e.vat, 0) +
      payrollsVAT.reduce((sum, p) => sum + p.vat, 0) +
      paymentsVAT.reduce((sum, pm) => sum + pm.vat, 0);

    res.json({ expensesVAT, payrollsVAT, paymentsVAT, totalVAT });
  } catch (error) {
    console.error('Error fetching VAT report:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch VAT report' });
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));