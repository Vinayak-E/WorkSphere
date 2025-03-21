import mongoose from 'mongoose';
import { envConfig } from './envConfig';
import { container } from 'tsyringe';

const MONGO_URI = envConfig.MONGODB_URI || 'mongodb://localhost:27017/MainDB';

export default async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MainDB connected successfully');
    container.register('MainConnection', { useValue: mongoose.connection });
  } catch (err) {
    console.log('Database connection error:', err);
    throw err; 
  }
};
export const connectTenantDB = async (tenantId: string) => {
  const tenantDBURI = `${MONGO_URI.replace('WorkSphere', tenantId)}`;
  console.log('tenat',tenantDBURI)
  const tenantConnection = mongoose.createConnection(tenantDBURI);

  tenantConnection.on('connected', () =>
    console.log(`Connected to tenant database: ${tenantId}`)
  );

  return tenantConnection;
};
