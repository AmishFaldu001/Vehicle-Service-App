import { MigrationInterface, QueryRunner } from 'typeorm';

export class agencyAvailabilityEntity1662124526661
  implements MigrationInterface
{
  name = 'agencyAvailabilityEntity1662124526661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "agency_availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startHour" integer NOT NULL, "endHour" integer NOT NULL, CONSTRAINT "PK_43c79017ed327eae2ce991a502d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "agency_availability"`);
  }
}
