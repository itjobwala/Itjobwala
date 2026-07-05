import { Model } from 'objection';

export default class SavedCandidate extends Model {
  static get tableName() { return 'saved_candidates'; }
}
