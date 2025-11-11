import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string
  
  @column()
  public nickname: string
  
  @column()
  public name: string | null
  
  @column()
  public lastname: string | null
  
  @column()
  public phone: string | null

  @column()
  public birthdate: Date | null

  @column()
  public age: number

  @column()
  public country: string | null

  @column()
  public photo: string | null

  @column()
  public code: string | null

  @column()
  public active: boolean

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
