import { Assignment } from '../entities/Assignment';

export interface AssignmentRepository {
  save(assignment: Assignment): Promise<void>;
  findById(id: string): Promise<Assignment | null>;
  findActiveByAssetId(assetId: string): Promise<Assignment | null>;
  findAllByAssetId(assetId: string): Promise<Assignment[]>;
  update(assignment: Assignment): Promise<void>;
}
