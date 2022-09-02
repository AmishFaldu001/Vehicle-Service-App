import { MigrationInterface, QueryRunner } from 'typeorm';

export class appointmentTimeWithTimezone1662122561011
  implements MigrationInterface
{
  name = 'appointmentTimeWithTimezone1662122561011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "appointmentStartTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "appointmentStartTime" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "appointmentEndTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "appointmentEndTime" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "appointmentEndTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "appointmentEndTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "appointmentStartTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "appointmentStartTime" TIMESTAMP NOT NULL`,
    );
  }
}
