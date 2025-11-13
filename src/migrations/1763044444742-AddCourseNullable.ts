import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseNullable1763044444742 implements MigrationInterface {
	name = 'AddCourseNullable1763044444742'

	public async up(queryRunner: QueryRunner): Promise<void> {
		// 1. Добавляем колонку, пока ещё nullable
		await queryRunner.query(`ALTER TABLE "file_entity" ADD "userId" uuid`);

		// 2. Проставляем какой-то userId для старых записей.
		//    Здесь можно:
		//    - либо взять реальный id существующего пользователя,
		//    - либо специальный системный uuid.
		//    Пример с "системным" пользователем:
		await queryRunner.query(
			`UPDATE "file_entity" SET "userId" = '00000000-0000-0000-0000-000000000000' WHERE "userId" IS NULL`,
		);

		// 3. Теперь можем запретить NULL
		await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "userId" SET NOT NULL`);

		// 4. Делаем courseId nullable, как и планировали
		await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "courseId" DROP NOT NULL`);
	}


	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "file_entity" ALTER COLUMN "courseId" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "file_entity" DROP COLUMN "userId"`);
	}

}
