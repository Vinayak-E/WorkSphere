import { Connection, Document, Model, PopulateOptions, Schema } from 'mongoose';

class BaseRepository<T extends Document> {
  private modelName: string;
  private schema: Schema;
  protected defaultConnection: Connection; 

  constructor(modelName: string, schema: Schema ,defaultConnection: Connection) {
    this.modelName = modelName;
    this.schema = schema;
    this.defaultConnection = defaultConnection;
  }

  protected getModel(tenantConnection?: Connection): Model<T> {
    return (tenantConnection || this.defaultConnection).model<T>(this.modelName, this.schema);
  }

  async create(data: Partial<T>, tenantConnection?: Connection): Promise<T> {
    const model = this.getModel(tenantConnection);
    const document = new model(data);
    return await document.save();
  }

  async findById(id: string, tenantConnection?: Connection): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findById(id).exec();
  }

  async findAll(query: Record<string, any> = {}, tenantConnection?: Connection): Promise<T[]> {
    const model = this.getModel(tenantConnection);
    return await model.find(query).exec();
  }

  async findOne(query: Record<string, any>, tenantConnection?: Connection): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findOne(query).exec();
  }

  async update(id: string, data: Partial<T>, tenantConnection?: Connection): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string, tenantConnection?: Connection): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findByIdAndDelete(id).exec();
  }

  async findByIdAndPopulate(
    id: string,
    populateFields: (string | PopulateOptions)[],
    tenantConnection?: Connection
  ): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findById(id).populate(populateFields).exec();
  }

  async findOneAndUpdate(
    query: Record<string, any>,
    update: Partial<T>,
    options: Record<string, any> = {},
    tenantConnection?: Connection
  ): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findOneAndUpdate(query, update, { ...options, new: true }).exec();
  }
}
export default BaseRepository;