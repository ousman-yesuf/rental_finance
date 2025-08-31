import { configureStore } from '@reduxjs/toolkit';
import buildingsReducer from './features/buildingsSlice';
import rentalUnitsReducer from './features/rentalUnitsSlice';
import paymentsReducer from './features/paymentsSlice';
import expensesReducer from './features/expensesSlice';
import payrollReducer from './features/payrollSlice';
import auditsReducer from './features/auditsSlice';
import summaryReducer from './features/summarySlice';
import vatReportReducer from './features/vatReportSlice';




export const store = configureStore({
  reducer: {
    buildings: buildingsReducer,
    rentalUnits: rentalUnitsReducer,
    payments: paymentsReducer,
    expenses: expensesReducer,
    payroll: payrollReducer,
    audits: auditsReducer,
    summary: summaryReducer,
    vatReport: vatReportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;