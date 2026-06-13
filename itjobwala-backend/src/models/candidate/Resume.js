import { Model } from 'objection';

class Resume extends Model {
  static get tableName() { return 'resumes'; }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['candidate_id', 'title', 'template'],
      properties: {
        id:           { type: 'integer' },
        candidate_id: { type: 'integer' },
        title:        { type: 'string', maxLength: 255 },
        template:     { type: 'string', maxLength: 50 },
        content:      { type: 'object' },
        created_at:   { type: ['string', 'null'] },
        updated_at:   { type: ['string', 'null'] },
      },
    };
  }

  static get jsonAttributes() {
    return ['content'];
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

export default Resume;
