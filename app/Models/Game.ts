import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import UserStatistic from './UserStatistic'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string
  
  @column()
  public description: string
  
  @column()
  public image: string
    
  @column()
  public rules: string
  
  @hasMany(() => UserStatistic, {
    localKey: 'id',
    foreignKey: 'game_id', 
  })
  public userStatistics: HasMany<typeof UserStatistic>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
