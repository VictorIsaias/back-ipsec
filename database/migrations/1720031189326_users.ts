import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email').notNullable().unique()
      table.string('nickname').notNullable().unique()
      table.string('name').nullable()
      table.string('lastname').nullable()
      table.string('phone').nullable().unique()
      table.date('birthdate').nullable()
      table.integer('age').nullable()
      table.string('country').nullable()
      table.string('photo').nullable()
      table.string('code').nullable()
      table.boolean('active').notNullable()
      table.string('password').notNullable()
      table.string('remember_me_token').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
