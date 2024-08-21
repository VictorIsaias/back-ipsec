import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Game from './Game'

export default class UserStatistic extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public played_games: number

  @column()
  public won_games: number

  @column()
  public lost_games: number

  @column()
  public played_rounds: number

  @column()
  public won_rounds: number

  @column()
  public lost_rounds: number

  @column()
  public user_id: number

  @column()
  public game_id: number

  @belongsTo(() => User, {
    localKey: 'user_id',  
    foreignKey: 'id',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Game, {
    localKey: 'game_id',  
    foreignKey: 'id',
  })
  public game: BelongsTo<typeof Game>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
