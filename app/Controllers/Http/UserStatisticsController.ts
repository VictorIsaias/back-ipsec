import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import UserStatistic from 'App/Models/UserStatistic'

export default class UserStatisticsController {
    
  public async index({request}: HttpContextContract) {

    var userStatistics: UserStatistic[] 
    if(request.input('page')||request.input('limit')){
      const page = request.input('page',1)
      const limit = request.input('limit',3)
      userStatistics = await UserStatistic.query()
        .preload('user')
        .preload('game')
        .paginate(page,limit)
    }else{
        userStatistics = await UserStatistic.query()
        .preload('user')
        .preload('game')
    }

    return {
      "type":"Exitoso",
      "title":"Recursos encontrados",
      "message":"La lista de estadisticas de usuarios ha sido encontrada con exito",
      "data":userStatistics,
    }
  }

  public async store({request,response,auth,params}: HttpContextContract) {

    await request.validate({
      schema: schema.create({
        played_games: schema.number(),
        won_games: schema.number(),
        lost_games: schema.number(),
      }),
      messages: {
        'played_games.required': 'El numero de juegos es obligatorio para crear un recurso de estadisticas',
        'won_games.required': 'El numero de juegos ganados es obligatorio para crear un recurso de estadisticas',
        'lost_games.required': 'El numero de juegos perdidos es obligatorio para crear un recurso de estadisticas',
      }
    })

    var user = auth.user
    if(!user){
      response.notFound({                 
          "type":"Error",
          "title": "Recurso no encontrado",
          "message": "El recurso de estadisticas no pudo encontrarse",
          "errors": [] 
      })
      return
    }
    const verify = await UserStatistic.query()
    .where('user_id',user.id)
    .where('game_id',params.game_id)
    .first()


    const userStatistics = new UserStatistic()
    try{
      if(verify){
        userStatistics.played_games = 0
        userStatistics.won_games = 0
        userStatistics.lost_games = 0
        userStatistics.user_id = user.id
        userStatistics.game_id = params.game_id
        await userStatistics.save()
      }

    }catch(error){
      response.internalServerError({                 
        "type":"Error",
        "title": "Error de sevidor",
        "message": "Hubo un fallo en el servidor durante el registro de los datos",
        "errors": error
      })
      return
    }
    
    response.status(201)
    response.send ({
      "type":"Exitoso",
      "title":"Recurso creado",
      "message":"El recurso estadisticas ha sido creado exitosamente",
      "data":userStatistics,
    })
  }

  public async show({params,response,auth}: HttpContextContract) {

    var user = auth.user
    if(!user){
      response.notFound({                 
          "type":"Error",
          "title": "Recurso no encontrado",
          "message": "El recurso de estadisticas no pudo encontrarse",
          "errors": [] 
      })
      return
    }

    const userStatistics = await UserStatistic.query()
      .where('user_id',user.id)
      .where('game_id',params.game_id)
      .preload('user')
      .preload('game')
      .first()
    if(userStatistics){
      response.send ({
        "type":"Exitoso",
        "title":"Recurso encontrado",
        "message":"El recurso de estadisticas ha sido encontrado con exito",
        "data":userStatistics,
      })
    }
    else{
      response.notFound({                 
        "type":"Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de estadisticas no pudo encontrarse",
        "errors": [] 
      })
    }
  }

  public async update({params,auth,request,response}: HttpContextContract) {

    const body = request.all()

    await request.validate({
        schema: schema.create({
          played_games: schema.number.nullableAndOptional(),
          won_games: schema.number.nullableAndOptional(),
          lost_games: schema.number.nullableAndOptional()
        })
      })

    var user = auth.user
    if(!user){
    response.notFound({                 
        "type":"Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de estadisticas no pudo encontrarse",
        "errors": [] 
    })
    return
    }
    const userStatistics = await UserStatistic.query()
      .where('user_id',user.id)
      .where('game_id',params.game_id)
      .first()
    if(!userStatistics){
        response.notFound({                 
            "type":"Error",
            "title": "Recurso no encontrado",
            "message": "El recurso de estadisticas no pudo encontrarse",
            "errors": [] 
            })
        return
    }
    try{
      if(body.played_games){
        userStatistics.played_games = body.played_games
      }
      if(body.won_games){
        userStatistics.won_games = body.won_games
      }
      if(body.lost_games){
        userStatistics.lost_games = body.lost_games
      }
      userStatistics.save()
    }catch(error){
      response.internalServerError({                 
        "type":"Error",
        "title": "Error de sevidor",
        "message": "Hubo un fallo en el servidor durante el registro de los datos",
        "errors": error
      })
      return
    }

    response.send ({
      "type":"Exitoso",
      "title":"Recurso actualizado",
      "message":"El de estadisticas ha sido actualizado exitosamente",
      "data":userStatistics,
    })
    
  }

  public async destroy({params,response,auth}: HttpContextContract) {

    var user = auth.user
    if(!user){
    response.notFound({                 
        "type":"Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de estadisticas no pudo encontrarse",
        "errors": [] 
    })
    return
    }

    const userStatistics = await UserStatistic.query()
    .where('user_id',user.id)
    .where('game_id',params.game_id)
    .first()

    if(!userStatistics){
        response.notFound({                 
            "type":"Error",
            "title": "Recurso no encontrado",
            "message": "El recurso de estadisticas no pudo encontrarse",
            "errors": [] 
            })
        return
    }

    if(userStatistics){
     
      await userStatistics.delete()

      response.send ({
        "type":"Exitoso",
        "title":"Recurso eliminado",
        "message":"El recurso de estadistica ha sido eliminado exitosamente",
        "data":userStatistics,
      })
    }
    else{
      response.notFound({                 
        "type":"Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de estadistica no pudo encontrarse",
        "errors": [] 
      })
    }

  }
  public async showGameRanking({params,response}: HttpContextContract) {

    const userStatistics = await UserStatistic.query()
      .where('game_id',params.game_id)
      .preload('user')
      .preload('game')
      .orderBy('won_games',"desc")

    if(userStatistics){
      response.send ({
        "type":"Exitoso",
        "title":"Recurso encontrado",
        "message":"El recurso de estadisticas ha sido encontrado con exito",
        "data":userStatistics,
      })
    }
    else{
      response.notFound({                 
        "type":"Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de estadisticas no pudo encontrarse",
        "errors": [] 
      })
    }
  }
}
