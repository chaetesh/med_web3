// frontend/src/lib/services/genetic-risk.service.ts
import { config } from '../config/env';
import { GeneticRiskAssessment } from '../types/family.types';

const API_BASE_URL = config.api.baseUrl || '';

export class GeneticRiskService {
  static async getUserRiskAssessments(): Promise<GeneticRiskAssessment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/genetic-risk/assessments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('medichain-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching risk assessments: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getUserRiskAssessments:', error);
      throw error;
    }
  }

  static async generateRiskAssessment(): Promise<GeneticRiskAssessment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/genetic-risk/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('medichain-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error generating risk assessment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateRiskAssessment:', error);
      throw error;
    }
  }
}
