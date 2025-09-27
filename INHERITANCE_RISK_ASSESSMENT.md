# Inheritance Risk Assessment Feature Implementation

This document outlines the implementation plan for adding a new feature called "Inheritance Risk Assessment" to the MediChain platform. This feature will allow patients to add family relationships to their accounts and view potential disease risks based on their family's medical history.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [ML Model Integration](#ml-model-integration)
6. [Database Schema Changes](#database-schema-changes)
7. [API Documentation](#api-documentation)
8. [Testing Plan](#testing-plan)
9. [Deployment Process](#deployment-process)

## Overview

The Inheritance Risk Assessment feature will enable:

1. Patients to connect their accounts with family members' accounts
2. Family relationship tracking (parent, sibling, child, etc.)
3. Analysis of medical records across family members to identify hereditary patterns
4. Risk assessment for potential hereditary diseases
5. Visualization of family medical history and risk factors

## System Architecture

### Components Interaction

```
┌───────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│                   │     │                    │     │                    │
│  Frontend (Next)  │◄────┤  Backend (NestJS)  │◄────┤  ML Service        │
│                   │     │                    │     │                    │
└───────────┬───────┘     └────────────┬───────┘     └────────────────────┘
            │                          │
            │                          │
            ▼                          ▼
┌───────────────────┐     ┌────────────────────┐
│                   │     │                    │
│  IPFS/Blockchain  │     │  MongoDB           │
│                   │     │                    │
└───────────────────┘     └────────────────────┘
```

## Backend Implementation

### 1. Database Schema Changes

#### New Schema: `FamilyRelationship`

```typescript
// backend/src/modules/family/schemas/family-relationship.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum RelationshipType {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  OTHER = 'other',
}

export type FamilyRelationshipDocument = HydratedDocument<FamilyRelationship>;

@Schema({ timestamps: true })
export class FamilyRelationship extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  relatedUserId: User;

  @Prop({ type: String, enum: RelationshipType, required: true })
  relationshipType: RelationshipType;

  @Prop({ default: true })
  isConfirmed: boolean;

  @Prop()
  confirmedAt: Date;

  @Prop({ default: false })
  shareGeneticData: boolean;
}

export const FamilyRelationshipSchema = SchemaFactory.createForClass(FamilyRelationship);
```

#### New Schema: `GeneticRiskAssessment`

```typescript
// backend/src/modules/family/schemas/genetic-risk-assessment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type GeneticRiskAssessmentDocument = HydratedDocument<GeneticRiskAssessment>;

@Schema({ timestamps: true })
export class GeneticRiskAssessment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  diseaseName: string;

  @Prop({ required: true, min: 0, max: 100 })
  riskPercentage: number;

  @Prop()
  factors: string[];

  @Prop()
  familyHistoryContribution: {
    userId: MongooseSchema.Types.ObjectId,
    condition: string,
    relationship: string,
    impact: number
  }[];

  @Prop()
  recommendations: string[];
  
  @Prop({ default: Date.now })
  assessedAt: Date;
}

export const GeneticRiskAssessmentSchema = SchemaFactory.createForClass(GeneticRiskAssessment);
```

### 2. Create Family Module

```typescript
// backend/src/modules/family/family.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyRelationship, FamilyRelationshipSchema } from './schemas/family-relationship.schema';
import { GeneticRiskAssessment, GeneticRiskAssessmentSchema } from './schemas/genetic-risk-assessment.schema';
import { FamilyRelationshipController } from './family-relationship.controller';
import { FamilyRelationshipService } from './family-relationship.service';
import { GeneticRiskController } from './genetic-risk.controller';
import { GeneticRiskService } from './genetic-risk.service';
import { UsersModule } from '../users/users.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { MlModule } from '../ml/ml.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FamilyRelationship.name, schema: FamilyRelationshipSchema },
      { name: GeneticRiskAssessment.name, schema: GeneticRiskAssessmentSchema },
    ]),
    UsersModule,
    MedicalRecordsModule,
    MlModule,
  ],
  controllers: [FamilyRelationshipController, GeneticRiskController],
  providers: [FamilyRelationshipService, GeneticRiskService],
  exports: [FamilyRelationshipService, GeneticRiskService],
})
export class FamilyModule {}
```

### 3. Family Relationship Service

```typescript
// backend/src/modules/family/family-relationship.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FamilyRelationship, FamilyRelationshipDocument, RelationshipType } from './schemas/family-relationship.schema';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class FamilyRelationshipService {
  constructor(
    @InjectModel(FamilyRelationship.name) private familyRelationshipModel: Model<FamilyRelationshipDocument>,
    private readonly usersService: UsersService,
  ) {}

  async createRelationship(
    userId: string, 
    relatedUserId: string, 
    relationshipType: RelationshipType
  ): Promise<FamilyRelationship> {
    // Validate users exist and are patients
    const [user, relatedUser] = await Promise.all([
      this.usersService.findById(userId),
      this.usersService.findById(relatedUserId)
    ]);
    
    if (!user || user.role !== UserRole.PATIENT) {
      throw new BadRequestException('User must be a patient');
    }
    
    if (!relatedUser || relatedUser.role !== UserRole.PATIENT) {
      throw new BadRequestException('Related user must be a patient');
    }
    
    // Check if relationship already exists
    const existingRelationship = await this.familyRelationshipModel.findOne({
      userId: new Types.ObjectId(userId),
      relatedUserId: new Types.ObjectId(relatedUserId)
    }).exec();
    
    if (existingRelationship) {
      throw new ConflictException('Relationship already exists');
    }
    
    // Create relationship (unconfirmed initially)
    const relationship = new this.familyRelationshipModel({
      userId,
      relatedUserId,
      relationshipType,
      isConfirmed: false,
    });
    
    return await relationship.save();
  }
  
  async confirmRelationship(
    userId: string, 
    relationshipId: string
  ): Promise<FamilyRelationship> {
    const relationship = await this.familyRelationshipModel.findById(relationshipId).exec();
    
    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }
    
    if (relationship.relatedUserId.toString() !== userId) {
      throw new BadRequestException('Only the related user can confirm this relationship');
    }
    
    relationship.isConfirmed = true;
    relationship.confirmedAt = new Date();
    
    return await relationship.save();
  }
  
  async getRelationships(userId: string): Promise<any[]> {
    const relationships = await this.familyRelationshipModel.find({
      $or: [
        { userId: new Types.ObjectId(userId) },
        { relatedUserId: new Types.ObjectId(userId) }
      ]
    })
    .populate('userId', 'firstName lastName email')
    .populate('relatedUserId', 'firstName lastName email')
    .exec();
    
    // Transform data for consistency
    return relationships.map(rel => {
      const isInitiator = rel.userId.toString() === userId;
      
      return {
        _id: rel._id,
        relationshipId: rel._id,
        relationshipType: rel.relationshipType,
        isConfirmed: rel.isConfirmed,
        confirmedAt: rel.confirmedAt,
        shareGeneticData: rel.shareGeneticData,
        familyMember: isInitiator ? rel.relatedUserId : rel.userId,
        // Calculate reverse relationship type if needed
        relationType: isInitiator ? rel.relationshipType : this.getReversedRelationType(rel.relationshipType),
      };
    });
  }
  
  private getReversedRelationType(relationType: RelationshipType): RelationshipType {
    switch (relationType) {
      case RelationshipType.PARENT:
        return RelationshipType.CHILD;
      case RelationshipType.CHILD:
        return RelationshipType.PARENT;
      case RelationshipType.GRANDPARENT:
        return RelationshipType.GRANDCHILD;
      case RelationshipType.GRANDCHILD:
        return RelationshipType.GRANDPARENT;
      // Sibling and spouse remain the same
      case RelationshipType.SPOUSE:
      case RelationshipType.SIBLING:
      case RelationshipType.OTHER:
      default:
        return relationType;
    }
  }
}
```

### 4. Genetic Risk Service

```typescript
// backend/src/modules/family/genetic-risk.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GeneticRiskAssessment, GeneticRiskAssessmentDocument } from './schemas/genetic-risk-assessment.schema';
import { FamilyRelationshipService } from './family-relationship.service';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { MlService } from '../ml/ml.service';

@Injectable()
export class GeneticRiskService {
  private readonly logger = new Logger(GeneticRiskService.name);

  constructor(
    @InjectModel(GeneticRiskAssessment.name) 
    private geneticRiskAssessmentModel: Model<GeneticRiskAssessmentDocument>,
    private readonly familyRelationshipService: FamilyRelationshipService,
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly mlService: MlService,
  ) {}
  
  async generateRiskAssessment(userId: string): Promise<GeneticRiskAssessment[]> {
    try {
      // 1. Get all confirmed family relationships with shareGeneticData=true
      const relationships = await this.familyRelationshipService.getRelationships(userId);
      const confirmedRelationships = relationships.filter(rel => 
        rel.isConfirmed && rel.shareGeneticData
      );
      
      // 2. Get medical records for the user and related family members
      const userRecords = await this.medicalRecordsService.getRecordsByPatientId(userId);
      
      // Build family medical history
      const familyHistory = [];
      for (const rel of confirmedRelationships) {
        const familyMemberId = rel.familyMember._id.toString();
        const familyMemberRecords = await this.medicalRecordsService.getRecordsByPatientId(familyMemberId);
        
        familyHistory.push({
          userId: familyMemberId,
          relationship: rel.relationType,
          records: familyMemberRecords
        });
      }
      
      // 3. Process data with ML service to generate risk assessments
      const riskAssessments = await this.mlService.analyzeGeneticRisks(userId, userRecords, familyHistory);
      
      // 4. Save results to database
      const savedAssessments = [];
      for (const risk of riskAssessments) {
        const riskAssessment = new this.geneticRiskAssessmentModel({
          userId,
          diseaseName: risk.diseaseName,
          riskPercentage: risk.riskPercentage,
          factors: risk.factors,
          familyHistoryContribution: risk.familyHistoryContribution,
          recommendations: risk.recommendations,
          assessedAt: new Date()
        });
        
        savedAssessments.push(await riskAssessment.save());
      }
      
      return savedAssessments;
    } catch (error) {
      this.logger.error(`Error generating risk assessment: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async getUserRiskAssessments(userId: string): Promise<GeneticRiskAssessment[]> {
    return this.geneticRiskAssessmentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ riskPercentage: -1 }) // Highest risk first
      .exec();
  }
}
```

## Frontend Implementation

### 1. Types Definition

```typescript
// frontend/src/lib/types.ts (additions)

export enum RelationshipType {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  OTHER = 'other',
}

export interface FamilyRelationship {
  _id: string;
  relationshipId: string;
  relationshipType: RelationshipType;
  isConfirmed: boolean;
  confirmedAt: string;
  shareGeneticData: boolean;
  familyMember: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  relationType: RelationshipType;
}

export interface GeneticRiskAssessment {
  _id: string;
  userId: string;
  diseaseName: string;
  riskPercentage: number;
  factors: string[];
  familyHistoryContribution: {
    userId: string;
    condition: string;
    relationship: string;
    impact: number;
  }[];
  recommendations: string[];
  assessedAt: string;
}
```

### 2. Family Relationship Service

```typescript
// frontend/src/lib/services/family-relationship.service.ts
import { config } from '../config/env';
import { ApiErrorClass } from './auth.service';
import { FamilyRelationship, RelationshipType } from '../types';

const API_BASE_URL = config.api.baseUrl;

export class FamilyRelationshipService {
  static async getRelationships(): Promise<FamilyRelationship[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/family/relationships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new ApiErrorClass(
          `Error fetching relationships: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getRelationships:', error);
      throw error;
    }
  }

  static async createRelationship(
    email: string,
    relationshipType: RelationshipType
  ): Promise<FamilyRelationship> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/family/relationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ email, relationshipType }),
      });

      if (!response.ok) {
        throw new ApiErrorClass(
          `Error creating relationship: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in createRelationship:', error);
      throw error;
    }
  }

  static async confirmRelationship(
    relationshipId: string
  ): Promise<FamilyRelationship> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/family/relationships/${relationshipId}/confirm`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new ApiErrorClass(
          `Error confirming relationship: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in confirmRelationship:', error);
      throw error;
    }
  }

  static async updateSharingPreferences(
    relationshipId: string,
    shareGeneticData: boolean
  ): Promise<FamilyRelationship> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/family/relationships/${relationshipId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ shareGeneticData }),
        }
      );

      if (!response.ok) {
        throw new ApiErrorClass(
          `Error updating sharing preferences: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updateSharingPreferences:', error);
      throw error;
    }
  }
}
```

### 3. Genetic Risk Service

```typescript
// frontend/src/lib/services/genetic-risk.service.ts
import { config } from '../config/env';
import { ApiErrorClass } from './auth.service';
import { GeneticRiskAssessment } from '../types';

const API_BASE_URL = config.api.baseUrl;

export class GeneticRiskService {
  static async getUserRiskAssessments(): Promise<GeneticRiskAssessment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/genetic-risk/assessments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new ApiErrorClass(
          `Error fetching risk assessments: ${response.status}`,
          response.status
        );
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
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new ApiErrorClass(
          `Error generating risk assessment: ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateRiskAssessment:', error);
      throw error;
    }
  }
}
```

### 4. Create UI Components

#### Family Relationships Page

```tsx
// frontend/src/app/patient/family/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FamilyRelationshipService } from '@/lib/services/family-relationship.service';
import { FamilyRelationship, RelationshipType } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Users, UserPlus, Check, X, Share2, Shield } from 'lucide-react';

export default function FamilyRelationshipsPage() {
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(RelationshipType.OTHER);
  
  useEffect(() => {
    loadRelationships();
  }, []);
  
  async function loadRelationships() {
    try {
      setLoading(true);
      setError(null);
      const data = await FamilyRelationshipService.getRelationships();
      setRelationships(data);
    } catch (err) {
      console.error('Failed to load relationships:', err);
      setError('Failed to load family relationships');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleAddRelationship(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !relationshipType) return;
    
    try {
      await FamilyRelationshipService.createRelationship(email, relationshipType);
      setShowAddForm(false);
      setEmail('');
      setRelationshipType(RelationshipType.OTHER);
      await loadRelationships();
    } catch (err) {
      console.error('Failed to add relationship:', err);
      setError('Failed to add family relationship');
    }
  }
  
  async function handleConfirmRelationship(relationshipId: string) {
    try {
      await FamilyRelationshipService.confirmRelationship(relationshipId);
      await loadRelationships();
    } catch (err) {
      console.error('Failed to confirm relationship:', err);
      setError('Failed to confirm relationship');
    }
  }
  
  async function handleUpdateSharing(relationshipId: string, shareGeneticData: boolean) {
    try {
      await FamilyRelationshipService.updateSharingPreferences(relationshipId, shareGeneticData);
      await loadRelationships();
    } catch (err) {
      console.error('Failed to update sharing preferences:', err);
      setError('Failed to update sharing preferences');
    }
  }
  
  function renderRelationshipType(type: RelationshipType) {
    const types = {
      [RelationshipType.PARENT]: 'Parent',
      [RelationshipType.CHILD]: 'Child',
      [RelationshipType.SIBLING]: 'Sibling',
      [RelationshipType.SPOUSE]: 'Spouse',
      [RelationshipType.GRANDPARENT]: 'Grandparent',
      [RelationshipType.GRANDCHILD]: 'Grandchild',
      [RelationshipType.OTHER]: 'Other relation',
    };
    
    return types[type] || 'Unknown';
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Family Relationships" 
        description="Manage your family connections for inheritance risk assessment"
        icon={<Users className="h-8 w-8" />}
      />
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          icon={<UserPlus className="h-5 w-5" />}
        >
          {showAddForm ? 'Cancel' : 'Add Family Member'}
        </Button>
      </div>
      
      {showAddForm && (
        <Card className="mb-6 p-4">
          <h3 className="text-lg font-medium mb-3">Add Family Member</h3>
          <form onSubmit={handleAddRelationship}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Family Member's Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Relationship Type</label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                className="w-full p-2 border rounded"
                required
              >
                {Object.values(RelationshipType).map(type => (
                  <option key={type} value={type}>
                    {renderRelationshipType(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <Button type="submit">Send Invitation</Button>
          </form>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p>Loading family relationships...</p>
        ) : relationships.length === 0 ? (
          <p>You don't have any family relationships yet.</p>
        ) : (
          relationships.map(rel => (
            <Card key={rel._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-medium">
                    {rel.familyMember.firstName} {rel.familyMember.lastName}
                  </h3>
                  <p className="text-gray-600">{renderRelationshipType(rel.relationType)}</p>
                </div>
                <div>
                  {rel.isConfirmed ? (
                    <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded">
                      Confirmed
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">{rel.familyMember.email}</p>
              
              {!rel.isConfirmed ? (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleConfirmRelationship(rel.relationshipId)}
                    icon={<Check className="h-4 w-4" />}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {/* Handle reject */}}
                    icon={<X className="h-4 w-4" />}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rel.shareGeneticData}
                      onChange={() => handleUpdateSharing(rel.relationshipId, !rel.shareGeneticData)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">
                      {rel.shareGeneticData ? (
                        <span className="flex items-center text-green-700">
                          <Share2 className="h-4 w-4 mr-1" />
                          Sharing genetic data
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-700">
                          <Shield className="h-4 w-4 mr-1" />
                          Not sharing genetic data
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

#### Genetic Risk Assessment Page

```tsx
// frontend/src/app/patient/risk-assessment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { GeneticRiskService } from '@/lib/services/genetic-risk.service';
import { FamilyRelationshipService } from '@/lib/services/family-relationship.service';
import { GeneticRiskAssessment, FamilyRelationship } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  UserPlus,
} from 'lucide-react';

export default function GeneticRiskAssessmentPage() {
  const [assessments, setAssessments] = useState<GeneticRiskAssessment[]>([]);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRisks, setExpandedRisks] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      const [assessmentsData, relationshipsData] = await Promise.all([
        GeneticRiskService.getUserRiskAssessments(),
        FamilyRelationshipService.getRelationships()
      ]);
      
      setAssessments(assessmentsData);
      setRelationships(relationshipsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load risk assessment data');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGenerateAssessment() {
    try {
      setGenerating(true);
      setError(null);
      
      const newAssessments = await GeneticRiskService.generateRiskAssessment();
      setAssessments(newAssessments);
    } catch (err) {
      console.error('Failed to generate assessment:', err);
      setError('Failed to generate risk assessment');
    } finally {
      setGenerating(false);
    }
  }
  
  function toggleRiskDetails(riskId: string) {
    setExpandedRisks(prev => ({
      ...prev,
      [riskId]: !prev[riskId]
    }));
  }
  
  function getRiskColor(percentage: number): string {
    if (percentage >= 70) return 'text-red-600';
    if (percentage >= 40) return 'text-orange-500';
    if (percentage >= 20) return 'text-yellow-500';
    return 'text-green-500';
  }
  
  function getConfirmedRelationships(): number {
    return relationships.filter(rel => rel.isConfirmed && rel.shareGeneticData).length;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Genetic Risk Assessment" 
        description="View your potential risk for hereditary conditions based on family medical history"
        icon={<Activity className="h-8 w-8" />}
      />
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-lg font-medium">Family Connections</h3>
            <p className="text-gray-600">
              {getConfirmedRelationships()} confirmed connections sharing genetic data
            </p>
          </div>
          
          <div className="mt-3 md:mt-0 flex space-x-3">
            <Button 
              href="/patient/family"
              variant="outline"
              icon={<UserPlus className="h-5 w-5" />}
            >
              Manage Family
            </Button>
            
            <Button 
              onClick={handleGenerateAssessment}
              disabled={generating || getConfirmedRelationships() === 0}
              icon={<RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />}
            >
              Generate Assessment
            </Button>
          </div>
        </div>
        
        {getConfirmedRelationships() === 0 && (
          <div className="mt-4 bg-blue-50 p-3 rounded-md text-blue-800 flex items-start">
            <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              To get a more accurate risk assessment, you need to connect with family members and 
              enable genetic data sharing. This helps analyze hereditary patterns across your family.
            </p>
          </div>
        )}
      </Card>
      
      <div className="space-y-4">
        {loading ? (
          <p>Loading risk assessments...</p>
        ) : assessments.length === 0 ? (
          <Card className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-xl font-medium mb-2">No Risk Assessments Available</h3>
            <p className="text-gray-600 mb-4">
              To generate a risk assessment, connect with family members and click "Generate Assessment".
            </p>
          </Card>
        ) : (
          assessments.map(risk => (
            <Card key={risk._id} className="p-4">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleRiskDetails(risk._id)}
              >
                <div>
                  <h3 className="text-lg font-medium">{risk.diseaseName}</h3>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          risk.riskPercentage >= 70 ? 'bg-red-500' :
                          risk.riskPercentage >= 40 ? 'bg-orange-400' :
                          risk.riskPercentage >= 20 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${risk.riskPercentage}%` }}
                      />
                    </div>
                    <span className={`font-medium ${getRiskColor(risk.riskPercentage)}`}>
                      {risk.riskPercentage}% risk
                    </span>
                  </div>
                </div>
                
                {expandedRisks[risk._id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              {expandedRisks[risk._id] && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Risk Factors:</h4>
                  <ul className="list-disc pl-5 mb-3">
                    {risk.factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                  
                  {risk.familyHistoryContribution.length > 0 && (
                    <>
                      <h4 className="font-medium mb-2">Family History Contribution:</h4>
                      <ul className="list-disc pl-5 mb-3">
                        {risk.familyHistoryContribution.map((contrib, idx) => (
                          <li key={idx}>
                            {contrib.relationship} with {contrib.condition} 
                            (Impact: {contrib.impact}%)
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5">
                    {risk.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

## ML Model Integration

### Create ML Risk Assessment Model

```python
# ml/genetic_risk_model.py

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
import joblib
import os

class GeneticRiskModel:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'models', 'genetic_risk_model.joblib')
        self.disease_list = [
            'Cardiovascular Disease',
            'Type 2 Diabetes',
            'Breast Cancer',
            'Colorectal Cancer',
            'Alzheimer\'s Disease',
            'Hypertension',
            'Asthma',
            'Depression',
            'Rheumatoid Arthritis',
            'Osteoporosis'
        ]
        
        # Load pre-trained model if it exists
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print("Model loaded successfully")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.train_model()
        else:
            print("No model found. Training new model.")
            self.train_model()
    
    def train_model(self):
        """Train a simple random forest model with synthetic data."""
        # Create synthetic training data
        print("Creating synthetic training data...")
        np.random.seed(42)
        
        # Features: family relationship, condition type, generation count
        n_samples = 1000
        family_relations = ['parent', 'sibling', 'child', 'grandparent', 'spouse', 'other']
        conditions = self.disease_list
        
        # Generate synthetic data
        X = []
        y = []
        
        for _ in range(n_samples):
            # Sample features
            relation_counts = np.random.randint(0, 3, size=len(family_relations))
            condition_counts = np.random.randint(0, 2, size=len(conditions))
            
            # Create feature vector
            features = np.concatenate([relation_counts, condition_counts])
            X.append(features)
            
            # Generate risk scores (target)
            # Higher risk for direct relatives with same condition
            risk_scores = []
            for disease_idx, disease in enumerate(conditions):
                # Base risk
                base_risk = np.random.normal(10, 5)
                
                # Add risk for family history
                parent_factor = relation_counts[0] * condition_counts[disease_idx] * np.random.normal(15, 3)
                sibling_factor = relation_counts[1] * condition_counts[disease_idx] * np.random.normal(10, 2)
                other_factor = sum(relation_counts[2:]) * condition_counts[disease_idx] * np.random.normal(5, 2)
                
                # Calculate total risk
                disease_risk = base_risk + parent_factor + sibling_factor + other_factor
                disease_risk = max(min(disease_risk, 95), 5)  # Cap between 5% and 95%
                
                risk_scores.append(disease_risk)
            
            y.append(risk_scores)
        
        # Convert to numpy arrays
        X = np.array(X)
        y = np.array(y)
        
        # Train a simple model for each disease
        self.model = {}
        for i, disease in enumerate(self.disease_list):
            rf = RandomForestClassifier(n_estimators=50, max_depth=5)
            # Convert continuous risk to categories for classification
            risk_categories = pd.cut(y[:, i], bins=5, labels=False)
            rf.fit(X, risk_categories)
            self.model[disease] = rf
            
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        print("Model trained and saved successfully")
    
    def predict_risk(self, patient_data, family_history):
        """
        Predict risk for a patient based on their data and family history
        
        Args:
            patient_data: Dictionary containing patient medical records
            family_history: List of dictionaries with family members' medical info
                Each dict should have: relationship, conditions
                
        Returns:
            List of dictionaries containing risk assessments
        """
        # Extract features from data
        features = self._extract_features(patient_data, family_history)
        
        # Predict risk for each disease
        risk_assessments = []
        
        for disease in self.disease_list:
            if disease not in self.model:
                continue
                
            # Predict risk category
            risk_category = self.model[disease].predict([features])[0]
            
            # Map category to risk percentage (0-4 -> 5-95%)
            risk_percentage = 5 + risk_category * 20 + np.random.normal(0, 5)
            risk_percentage = max(min(risk_percentage, 95), 5)  # Cap between 5% and 95%
            
            # Calculate family contribution factors
            family_contributions = []
            contributing_factors = []
            
            for relative in family_history:
                # Check if this relative has conditions relevant to the disease
                for condition in relative.get('conditions', []):
                    if self._are_conditions_related(disease, condition):
                        impact = self._calculate_impact_factor(relative['relationship'], disease)
                        
                        if impact > 0:
                            family_contributions.append({
                                'userId': relative.get('userId', 'unknown'),
                                'relationship': relative['relationship'],
                                'condition': condition,
                                'impact': round(impact)
                            })
                            
                            contributing_factors.append(
                                f"Family history of {condition} in {relative['relationship']}"
                            )
            
            # Add patient's own risk factors
            patient_factors = self._extract_patient_risk_factors(patient_data, disease)
            risk_factors = contributing_factors + patient_factors
            
            # Generate recommendations
            recommendations = self._generate_recommendations(disease, risk_percentage, risk_factors)
            
            risk_assessments.append({
                'diseaseName': disease,
                'riskPercentage': round(risk_percentage),
                'factors': risk_factors,
                'familyHistoryContribution': family_contributions,
                'recommendations': recommendations
            })
        
        # Sort by risk percentage (highest first)
        risk_assessments.sort(key=lambda x: x['riskPercentage'], reverse=True)
        return risk_assessments
    
    def _extract_features(self, patient_data, family_history):
        """Extract features from patient data and family history."""
        # Count relationships
        relation_counts = {rel: 0 for rel in ['parent', 'child', 'sibling', 'grandparent', 'spouse', 'other']}
        for relative in family_history:
            rel_type = relative.get('relationship', 'other').lower()
            if rel_type in relation_counts:
                relation_counts[rel_type] += 1
            else:
                relation_counts['other'] += 1
        
        # Count conditions in family
        condition_counts = {disease: 0 for disease in self.disease_list}
        for relative in family_history:
            for condition in relative.get('conditions', []):
                for disease in self.disease_list:
                    if self._are_conditions_related(disease, condition):
                        condition_counts[disease] += 1
        
        # Create feature vector
        features = list(relation_counts.values()) + list(condition_counts.values())
        return features
    
    def _are_conditions_related(self, disease, condition):
        """Check if condition is related to disease."""
        # Simple string matching for demonstration
        return condition.lower() in disease.lower() or disease.lower() in condition.lower()
    
    def _calculate_impact_factor(self, relationship, disease):
        """Calculate the impact factor based on relationship type."""
        impact_factors = {
            'parent': 15,
            'sibling': 10,
            'child': 8,
            'grandparent': 6,
            'grandchild': 6,
            'spouse': 2,
            'other': 1
        }
        
        rel_type = relationship.lower()
        if rel_type in impact_factors:
            return impact_factors[rel_type] + np.random.normal(0, 2)
        return impact_factors['other'] + np.random.normal(0, 1)
    
    def _extract_patient_risk_factors(self, patient_data, disease):
        """Extract patient-specific risk factors for the disease."""
        # This would analyze patient records for risk factors
        # For demo, return generic risk factors
        
        if 'cardiovascular' in disease.lower():
            return ['Age', 'Lifestyle factors']
        elif 'diabetes' in disease.lower():
            return ['BMI', 'Dietary habits']
        elif 'cancer' in disease.lower():
            return ['Age', 'Environmental factors']
        elif 'alzheimer' in disease.lower():
            return ['Age', 'Cognitive health']
        else:
            return ['Age', 'General health factors']
    
    def _generate_recommendations(self, disease, risk_percentage, risk_factors):
        """Generate recommendations based on disease and risk level."""
        recommendations = []
        
        # General recommendation
        recommendations.append(f"Discuss your {disease} risk with your healthcare provider")
        
        # Risk-based recommendations
        if risk_percentage >= 70:
            recommendations.append(f"Consider genetic testing for {disease}")
            recommendations.append("Schedule regular screenings with specialists")
        elif risk_percentage >= 40:
            recommendations.append("Consider preventive screenings earlier than standard guidelines")
            recommendations.append("Monitor symptoms that could be early indicators")
        else:
            recommendations.append("Follow standard screening guidelines for your age and gender")
        
        # Disease-specific recommendations
        if 'cardiovascular' in disease.lower():
            recommendations.append("Monitor blood pressure and cholesterol regularly")
        elif 'diabetes' in disease.lower():
            recommendations.append("Monitor blood sugar levels and maintain a healthy diet")
        elif 'cancer' in disease.lower():
            recommendations.append("Follow cancer screening guidelines appropriate for your age")
        
        return recommendations
```

### Update ML Module

```python
# ml/genetic_risk_api.py

from flask import Flask, request, jsonify
from genetic_risk_model import GeneticRiskModel
import os

app = Flask(__name__)
risk_model = GeneticRiskModel()

@app.route('/api/risk-assessment', methods=['POST'])
def analyze_genetic_risk():
    try:
        data = request.json
        
        # Extract required data
        patient_data = data.get('patientData', {})
        family_history = data.get('familyHistory', [])
        
        # Validate input
        if not patient_data or not family_history:
            return jsonify({'error': 'Missing patient data or family history'}), 400
            
        # Process the data through the model
        risk_assessments = risk_model.predict_risk(patient_data, family_history)
        
        return jsonify(risk_assessments)
    except Exception as e:
        print(f"Error processing risk assessment: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

## Database Schema Changes

### Add New Models to Users Module

```typescript
// backend/src/modules/users/schemas/family-relationship.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export enum RelationshipType {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  OTHER = 'other',
}

export type FamilyRelationshipDocument = HydratedDocument<FamilyRelationship>;

@Schema({ timestamps: true })
export class FamilyRelationship extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  relatedUserId: User;

  @Prop({ type: String, enum: RelationshipType, required: true })
  relationshipType: RelationshipType;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop()
  confirmedAt: Date;

  @Prop({ default: false })
  shareGeneticData: boolean;
}

export const FamilyRelationshipSchema = SchemaFactory.createForClass(FamilyRelationship);
// Add compound index to ensure uniqueness for each relationship pair
FamilyRelationshipSchema.index({ userId: 1, relatedUserId: 1 }, { unique: true });
```

```typescript
// backend/src/modules/users/schemas/genetic-risk.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type GeneticRiskDocument = HydratedDocument<GeneticRisk>;

@Schema({ timestamps: true })
export class GeneticRisk extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  diseaseName: string;

  @Prop({ required: true, min: 0, max: 100 })
  riskPercentage: number;

  @Prop({ type: [String] })
  factors: string[];

  @Prop({ type: [Object] })
  familyHistoryContribution: {
    userId: MongooseSchema.Types.ObjectId;
    condition: string;
    relationship: string;
    impact: number;
  }[];

  @Prop({ type: [String] })
  recommendations: string[];
  
  @Prop({ default: Date.now })
  assessedAt: Date;
}

export const GeneticRiskSchema = SchemaFactory.createForClass(GeneticRisk);
```

## API Documentation

### Family Relationship Endpoints

1. **GET /api/family/relationships**
   - Get all family relationships for the authenticated user
   - Response: Array of FamilyRelationship objects

2. **POST /api/family/relationships**
   - Create a new family relationship
   - Request body:
     ```json
     {
       "email": "relative@example.com",
       "relationshipType": "parent"
     }
     ```
   - Response: Created FamilyRelationship object

3. **PATCH /api/family/relationships/:id/confirm**
   - Confirm a relationship invitation
   - Response: Updated FamilyRelationship object

4. **PATCH /api/family/relationships/:id**
   - Update relationship preferences
   - Request body:
     ```json
     {
       "shareGeneticData": true
     }
     ```
   - Response: Updated FamilyRelationship object

5. **DELETE /api/family/relationships/:id**
   - Remove a family relationship
   - Response: Success message

### Genetic Risk Assessment Endpoints

1. **GET /api/genetic-risk/assessments**
   - Get all risk assessments for the authenticated user
   - Response: Array of GeneticRiskAssessment objects

2. **POST /api/genetic-risk/generate**
   - Generate new risk assessments based on family data
   - Response: Array of newly created GeneticRiskAssessment objects

## Testing Plan

1. **Unit Tests**
   - Test FamilyRelationshipService methods
   - Test GeneticRiskService methods
   - Test ML model accuracy with synthetic data

2. **Integration Tests**
   - Test relationship creation and confirmation flow
   - Test risk assessment generation with sample data
   - Test integration with ML service

3. **End-to-End Tests**
   - Complete user journey from creating relationships to viewing risk assessments
   - Test permissions and data sharing controls
   - Test accuracy of risk calculations with real-world scenarios

## Deployment Process

1. **Backend Deployment**
   - Add new modules to NestJS application
   - Update MongoDB schemas
   - Configure integration with ML service

2. **ML Service Deployment**
   - Deploy Python Flask service for risk assessment
   - Configure environment for model training and prediction

3. **Frontend Deployment**
   - Add new pages and components to Next.js app
   - Configure API integrations
   - Update navigation and user flows

4. **Testing**
   - Perform comprehensive testing in staging environment
   - Validate security and privacy controls
   - Test performance with large family networks

5. **Rollout**
   - Deploy to production with feature flag
   - Enable for limited users initially
   - Monitor performance and user feedback
   - Full rollout after validation
