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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FamilyRelationship.name, schema: FamilyRelationshipSchema },
      { name: GeneticRiskAssessment.name, schema: GeneticRiskAssessmentSchema },
    ]),
    UsersModule,
    MedicalRecordsModule,
    ConfigModule,
  ],
  controllers: [FamilyRelationshipController, GeneticRiskController],
  providers: [FamilyRelationshipService, GeneticRiskService],
  exports: [FamilyRelationshipService, GeneticRiskService],
})
export class FamilyModule {}
