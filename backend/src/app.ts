import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import indexRouter from './routes/indexRouter';
import adminRoter from './routes/admin/adminRoutes';
import companyRouter from './routes/company/companyRoutes'
import emloyeeRouter from  './routes/employee/employeeRoutes'
import { errorHandler } from './middlewares/errorMiddleware';
dotenv.config()


const app = express()

// Middlewares
app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
app.use(morgan('dev'))
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({  limit: '10mb',extended: false }));



app.use('/auth',indexRouter)
app.use('/admin',adminRoter)

app.use('/company',companyRouter)
app.use('/employee',emloyeeRouter)


app.use(errorHandler);

export default app