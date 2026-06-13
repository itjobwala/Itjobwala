import { Model } from 'objection';
import Experience from './Experience.js';
import Education from './Education.js';
import Certification from './Certification.js';

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['full_name', 'email', 'mobile', 'password', 'work_status', 'terms_accepted'],
      properties: {
        id: { type: 'integer' },
        full_name: { type: 'string', minLength: 2, maxLength: 255 },
        first_name: { type: 'string', maxLength: 255 },
        last_name: { type: 'string', maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        mobile: { type: 'string', minLength: 1, maxLength: 20 },
        password: { type: 'string', minLength: 1, maxLength: 255 },
        work_status: { type: 'string', enum: ['fresher', 'experienced'] },
        terms_accepted: { type: 'boolean' },
        title: { type: ['string', 'null'], maxLength: 255 },
        expected_salary: { type: ['string', 'null'], maxLength: 100 },
        current_salary: { type: ['string', 'null'], maxLength: 100 },
        career_profile: { type: ['object', 'null'] },
        personal_details: { type: ['object', 'null'] },
        experience_years: { type: ['integer', 'null'] },
        location: { type: ['string', 'null'], maxLength: 255 },
        linked_in: { type: ['string', 'null'], maxLength: 255 },
        github: { type: ['string', 'null'], maxLength: 255 },
        about: { type: ['string', 'null'] },
        profile_completion: { type: 'integer', default: 0 },
        open_to_work: { type: 'boolean', default: false },
        profile_photo_url: { type: ['string', 'null'], maxLength: 500 },
        availability_to_join: { type: ['string', 'null'], format: 'date' },
        profile_cover_url: { type: ['string', 'null'], maxLength: 500 },
        is_active: { type: 'boolean', default: true },
      }
    };
  }
  static get relationMappings() {
    return {
      experience: {
        relation: Model.HasManyRelation,
        modelClass: Experience,
        join: {
          from: 'users.id',
          to: 'experiences.user_id'
        }
      },
      education: {
        relation: Model.HasManyRelation,
        modelClass: Education,
        join: {
          from: 'users.id',
          to: 'education.user_id'
        }
      },
      certifications: {
        relation: Model.HasManyRelation,
        modelClass: Certification,
        join: {
          from: 'users.id',
          to: 'certifications.user_id'
        }
      }
    };
  }
}

export default User;
