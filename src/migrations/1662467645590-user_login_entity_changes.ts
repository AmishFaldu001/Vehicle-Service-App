import { MigrationInterface, QueryRunner } from 'typeorm';

export class userLoginEntityChanges1662467645590 implements MigrationInterface {
  name = 'userLoginEntityChanges1662467645590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password" character varying NOT NULL`,
    );
  }
}
