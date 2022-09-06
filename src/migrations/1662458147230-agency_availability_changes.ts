import { MigrationInterface, QueryRunner } from 'typeorm';

export class agencyAvailabilityChanges1662458147230
  implements MigrationInterface
{
  name = 'agencyAvailabilityChanges1662458147230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agency_availability" DROP COLUMN "endHour"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" DROP COLUMN "startHour"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."agency_availability_recurrentholidays_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" ADD "recurrentHolidays" "public"."agency_availability_recurrentholidays_enum" array`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" ADD "availableTimesForADay" jsonb array NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" ADD "holidays" TIMESTAMP WITH TIME ZONE array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agency_availability" DROP COLUMN "holidays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" DROP COLUMN "availableTimesForADay"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" DROP COLUMN "recurrentHolidays"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."agency_availability_recurrentholidays_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" ADD "startHour" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "agency_availability" ADD "endHour" integer NOT NULL`,
    );
  }
}
