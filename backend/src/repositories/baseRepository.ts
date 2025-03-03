import { Connection, Document, Model, PopulateOptions, Schema } from 'mongoose';

class BaseRepository<T extends Document> {
  private modelName: string;
  private schema: Schema;

  constructor(modelName: string, schema: Schema) {
    this.modelName = modelName;
    this.schema = schema;
  }

  protected getModel(tenantConnection: Connection): Model<T> {
    return tenantConnection.model<T>(this.modelName, this.schema);
  }

  async create(tenantConnection: Connection, data: Partial<T>): Promise<T> {
    const model = this.getModel(tenantConnection);
    const document = new model(data);
    return await document.save();
  }

  async findById(tenantConnection: Connection, id: string): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findById(id).exec();
  }

  async findAll(tenantConnection: Connection, query: Record<string, any> = {}): Promise<T[]> {
    const model = this.getModel(tenantConnection);
    return await model.find(query).exec();
  }

  async findOne(tenantConnection: Connection, query: Record<string, any>): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findOne(query).exec();
  }

  async update(tenantConnection: Connection, id: string, data: Partial<T>): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(tenantConnection: Connection, id: string): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findByIdAndDelete(id).exec();
  }

  async findByIdAndPopulate(
    tenantConnection: Connection,
    id: string,
    populateFields: (string | PopulateOptions)[]
  ): Promise<T | null> {
    const model = this.getModel(tenantConnection);
    return await model.findById(id).populate(populateFields).exec();
  }
}

export default BaseRepository;