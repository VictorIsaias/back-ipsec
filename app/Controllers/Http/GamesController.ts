import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Game from 'App/Models/Game'

export default class GamesController {
    
    public async index({request}: HttpContextContract) {

        var game: Game[] 
        if(request.input('page')||request.input('limit')){
          const page = request.input('page',1)
          const limit = request.input('limit',3)
          game = await Game.query()
            .paginate(page,limit)
        }else{
            game = await Game.query()
        }
    
        return {
          "type":"Exitoso",
          "title":"Recursos encontrados",
          "message":"La lista de juegos de usuarios ha sido encontrada con exito",
          "data":game,
        }
      }
    
      public async store({request,response}: HttpContextContract) {
        
        const body = request.all()
    
        await request.validate({
          schema: schema.create({
            name: schema.string(),
            description: schema.string(),
            image: schema.string(),
            rules: schema.string(),
          }),
          messages: {
            'name.required': 'El nombre de juego es obligatorio para crear un recurso de estadisticas',
            'description.required': 'La descripcion de juego es obligatorio para crear un recurso de estadisticas',
            'rules.required': 'Las reglas de juego son obligatorias para crear un recurso de estadisticas',
            }
        })
    
        const game = new Game()
        try{
            game.name = body.name
            game.description = body.description
            game.rules = body.rules
            await game.save()
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
          "message":"El recurso juego ha sido creado exitosamente",
          "data":game,
        })
      }
    
      public async show({params,response}: HttpContextContract) {
    
        const game = await Game.query()
          .where('id',params.game_id)
          .first()
        if(game){
          response.send ({
            "type":"Exitoso",
            "title":"Recurso encontrado",
            "message":"El recurso de juego ha sido encontrado con exito",
            "data":game,
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
    
      public async update({params,request,response}: HttpContextContract) {
    
        const body = request.all()
    
        await request.validate({
            schema: schema.create({
              name: schema.string.nullableAndOptional(),
              description: schema.string.nullableAndOptional(),
              rules: schema.string.nullableAndOptional()
            })
          })
    
        const game = await Game.query()
          .where('id',params.game_id)
          .first()
        if(!game){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de juego no pudo encontrarse",
                "errors": [] 
                })
            return
        }
        try{
          if(body.name){
            game.name = body.name
          }
          if(body.description){
            game.description = body.description
          }
          if(body.rules){
            game.rules = body.rules
          }
          if(body.image){
            game.image = body.image
          }
          game.save()
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
          "message":"El de juego ha sido actualizado exitosamente",
          "data":game,
        })
        
      }
    
      public async destroy({params,response}: HttpContextContract) {
    
        const game = await Game.query()
        .where('id',params.game_id)
        .first()
    
        if(!game){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de juego no pudo encontrarse",
                "errors": [] 
                })
            return
        }
    
        if(game){
         
          await game.delete()
          await game.related('userStatistics').query().delete()
    
          response.send ({
            "type":"Exitoso",
            "title":"Recurso eliminado",
            "message":"El recurso de juego ha sido eliminado exitosamente",
            "data":game,
          })
        }
        else{
          response.notFound({                 
            "type":"Error",
            "title": "Recurso no encontrado",
            "message": "El recurso de juego no pudo encontrarse",
            "errors": [] 
          })
        }
    
      }
    }
    