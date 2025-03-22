import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/indexRouter';
import adminRoter from './routes/admin/adminRoutes';
import companyRouter from './routes/company/companyRoutes';
import emloyeeRouter from './routes/employee/employeeRoutes';
import chatRouter from './routes/employee/chatRoutes';
import meetRouter from './routes/employee/meetRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import { container } from "tsyringe";
import { CheckoutController } from "./controllers/Implementation/checkout.controller";
dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3000",
      "https://worksphere.store",
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
const checkoutController  = container.resolve<CheckoutController>('CheckoutController');

app.use('/api/webhook', 
  express.raw({ type: 'application/json' }), 
checkoutController.handleWebhook
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use('/auth', indexRouter);
app.use('/admin', adminRoter);

 app.use('/meetings', meetRouter);
app.use('/company', companyRouter);
app.use('/employee', emloyeeRouter);
app.use('/chat', chatRouter);

app.use(errorHandler);

export default app;
