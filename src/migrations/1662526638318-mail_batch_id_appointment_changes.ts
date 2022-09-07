import { MigrationInterface, QueryRunner } from 'typeorm';

export class mailBatchIdAppointmentChanges1662526638318
  implements MigrationInterface
{
  name = 'mailBatchIdAppointmentChanges1662526638318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "batchId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "batchId"`);
  }
}
