import { z } from 'zod';

export const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  address: z.string().min(1, 'Address is required'),
});


export const tenantSchema = z.object({
  buildingId: z.number({ required_error: 'Building is required' }).min(1, 'Building is required'),
  unitNumber: z.string({ required_error: 'Unit number is required' }).min(1, 'Unit number is required'),
  tenantName: z.string().optional(),
  rentAmount: z.number({ required_error: 'Rent amount is required' }).min(0, 'Rent amount must be non-negative'),
  dueDate: z.date({ required_error: 'Due date is required' })
}).strict();

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  method: z.string().optional(),
  vat: z.number().nonnegative('VAT must be non-negative'),
});

export const expenseSchema = z.object({
  buildingId: z.number({ required_error: 'Building is required' }).min(1, 'Building ID must be a positive number'),
  description: z.string({ required_error: 'Description is required' }).min(1, 'Description cannot be empty'),
  amount: z.number({ required_error: 'Amount is required' }).min(0.01, 'Amount must be greater than 0'),
  date: z.date({ required_error: 'Date is required' }).refine(
    (date) => !isNaN(date.getTime()),
    { message: 'Invalid date' }
  ),
  category: z.string({ required_error: 'Category is required' }).min(1, 'Category cannot be empty'),
  vat: z.number({ required_error: 'VAT is required' }).min(0, 'VAT cannot be negative'),
}).strict();

export const payrollSchema = z.object({
  buildingId: z.number({ required_error: 'Building is required' }).min(1, 'Building ID must be a positive number'),
  employeeName: z.string({ required_error: 'Employee Name is required' }).min(1, 'Employee Name cannot be empty'),
  salary: z.number({ required_error: 'Salary is required' }).min(0.01, 'Salary must be greater than 0'),
  date: z.date({ required_error: 'Date is required' }).refine(
    (date) => !isNaN(date.getTime()),
    { message: 'Invalid date' }
  ),
  deductions: z.number({ required_error: 'Deductions are required' }).min(0, 'Deductions cannot be negative'),
  vat: z.number({ required_error: 'VAT is required' }).min(0, 'VAT cannot be negative'),
}).strict();