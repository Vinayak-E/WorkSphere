import { Model, Document, PopulateOptions } from 'mongoose';
import { IBaseRepository } from '../interfaces/IUser.types';

class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    if (!model) {
      throw new Error('Model is required for BaseRepository');
    }
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Error creating document: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new Error(
        `Error finding document by ID: ${(error as Error).message}`
      );
    }
  }

  async findAll(query: Record<string, any> = {}): Promise<T[]> {
    try {
      return await this.model.find(query).exec();
    } catch (error) {
      throw new Error(`Error finding documents: ${(error as Error).message}`);
    }
  }

  async findOne(query: Record<string, any>): Promise<T | null> {
    try {
      return await this.model.findOne(query).exec();
    } catch (error) {
      throw new Error(
        `Error finding one document: ${(error as Error).message}`
      );
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      throw new Error(`Error updating document: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new Error(`Error deleting document: ${(error as Error).message}`);
    }
  }

  async findByIdAndPopulate(
    id: string,
    populateFields: (string | PopulateOptions)[]
  ): Promise<T | null> {
    try {
      return await this.model.findById(id).populate(populateFields).exec();
    } catch (error) {
      throw new Error(
        `Error finding and populating document: ${(error as Error).message}`
      );
    }
  }
}

export default BaseRepository;
