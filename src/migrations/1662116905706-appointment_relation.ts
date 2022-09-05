import { MigrationInterface, QueryRunner } from 'typeorm';

export class appointmentRelation1662116905706 implements MigrationInterface {
  name = 'appointmentRelation1662116905706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "vehicleOwnerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "vehicleOwnerId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_f05b99031959197cf66f143aff4" FOREIGN KEY ("vehicleOwnerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_f05b99031959197cf66f143aff4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "vehicleOwnerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "vehicleOwnerId" character varying NOT NULL`,
    );
  }
}
