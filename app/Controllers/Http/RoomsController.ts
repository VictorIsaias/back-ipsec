import Game from "App/Models/Game";
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {Room} from "App/Models/Room";
import UserStatistic from "App/Models/UserStatistic";
import User from "App/Models/User";
interface roomInterface{
    room_code?: Number,
    host_player?: Number,
    invited_players?: Array<Number>,
    room_privacy?: String,
    game?: Number,
    matches?: [{
        match_number: Number,
        looser: Number,
        winner: Number,
    }]
}

export default class RoomsController {
    public async create({request,response,auth}: HttpContextContract) {
        const body = request.all()
        let room
        try{
            var code = ""
            var unique = true
            do{
                for (let i = 0; i < 9; i++) {
                    code += Math.floor(Math.random() * 10).toString();
                }
                let codes = await Room.find()
                codes.forEach(element => {
                    if(element.room_code==code){
                        unique=false
                    }
                });
            }while (!unique)
            var user = auth.user
            if(!user){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de sala no pudo encontrarse",
                "errors": auth
            }) 
            return
            }

            room = await new Room({
                room_code: code,
                host_player: user.id,
                invited_players: [],
                room_privacy: body.room_privacy,
                game: body.game,
                matches:[]
            })
            await room.save()
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
            "title":"Recurso actualizado",
            "message":"La sala ha sido creada exitosamente",
            "data":{
                room_code:room.room_code,
                room_privacy: room.room_privacy,
                game: room.game
            },
        })
    }

    public async update({request,params,response}: HttpContextContract) {
        const body = request.all()
        const code=params.room_code
        const option:roomInterface = {}
        let room
        try{
            if(body.matches){
                option.matches=body.matches
            }
            if(body.room_privacy){
                option.room_privacy=body.room_privacy
            }
            if(body.game){
                option.game=body.game
            }


            room = await Room.findOneAndUpdate({room_code:code},
                option)
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
            "message":"La sala ha sido actualizada exitosamente",
            "data":{
                room_code:room.room_code,
                game: room.game,
                room_privacy: room.room_privacy,
                matches:room.matches
            },
        })
    }

    public async show({params,response}: HttpContextContract) {
        const room = await Room.findOne({room_code:params.room_code})
        let thisRoom = {
            room_privacy:room.room_privacy,
            matches:room.matches,
            room_code:room.room_code,
            host_player:{},
            game:room.game,
            invited_players:[{}]

        }
        let host = await User.query().where('id',room.host_player).first()
        thisRoom.host_player = {
            nickname:host?.nickname,
            photo:host?.photo,
            country:host?.country
        }
        thisRoom.game = await Game.query().where('id',room.game).first()
        for (let index = 0; index < room.invited_players.length; index++) {
            let user = await User.query().where('id',room.invited_players[index]).first()
            thisRoom.invited_players[index] = {
                nickname:user?.nickname,
                photo:user?.photo,
                country:user?.country
            }
        }

        for (let index = 0; index < room.matches.length; index++) {
            let winner = await User.query().where('id',room.matches[index].winner).first()
            let looser = await User.query().where('id',room.matches[index].looser).first()
            thisRoom.matches[index].winner = {
                nickname:winner?.nickname,
                photo:winner?.photo,
                country:winner?.country
            }
            thisRoom.matches[index].looser = {
                nickname:looser?.nickname,
                photo:looser?.photo,
                country:looser?.country
            }
        }
        if(room){
            response.send ({
            "type":"Exitoso",
            "title":"Recurso encontrado",
            "message":"El recurso de sala ha sido encontrado con exito",
            "data":thisRoom,
            })
        }
        else{
            response.notFound({                 
            "type":"Error",
            "title": "Recurso no encontrado",
            "message": "El recurso de sala no pudo encontrarse",
            "errors": [] 
            })
        }
    }

    public async joinRoom({auth,params,response}: HttpContextContract) {
        var user = auth.user
        let room
        if(!user){
        response.notFound({                 
            "type":"Error",
            "title": "Recurso no encontrado",
            "message": "El recurso de usuario no pudo encontrarse",
            "errors": [] 
        }) 
        return
        }
        room = await Room.findOne({room_code:params.room_code})
        if(!room){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de sala no pudo encontrarse",
                "errors": [] 
            }) 
            return
            }

            await room.invited_players.push(user.id)
            await room.save()
        response.send ({
            "type":"Exitoso",
            "title":"Recurso actualizado",
            "message":"La sala ha sido actualizada exitosamente",
            "data":{
                room_code:room.room_code,
                game: room.game,
                room_privacy:room.room_privacy,
                matches:room.matches
            },
        })
    }

    public async verifyRoomAccess({auth,params,response}: HttpContextContract){
        let room
        const user = auth.user
        if(!user){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de usuario no pudo encontrarse",
                "errors": [] 
            }) 
            return
        }
        try{
            room = await Room.findOne({room_code:params.room_code})
            room.invited_players.forEach(element => {
                if(element==user.id){
                    response.send ({
                        "type":"Exitoso",
                        "title":"Recurso encontrado",
                        "message":"Verificado exitosamente",
                        "data":true,
                    })
                    return
                }
            });
        }catch(error){
            response.internalServerError({                 
                "type":"Error",
                "title": "Error de sevidor",
                "message": "Hubo un fallo en el servidor durante el registro de los datos",
                "errors": error
            })
            return
        }
    

        response.send({
            "type":"Exitoso",
            "title":"Recurso encontrado",
            "message":"Verificado exitosamente",
            "data":false,
        })
    }

    public async addWinnerMatch({auth,params,response}: HttpContextContract) {

        let room
        const user = auth.user
        if(!user){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de usuario no pudo encontrarse",
                "errors": [] 
            }) 
            return
        }
        const numMatches = await Room.aggregate([
            { $match: {room_code:params.room_code}},
            { $unwind: "$matches" },
            { $group: { _id: null, totalMatches: { $sum: 1 } } }
          ])
        const num:number = (numMatches.totalMatches+1)

        let match = {
            match_number:num,
            winner: user.id,
            looser: 0
        }

        try{
            room = Room.findOne({room_code:params.room_code})
            if(!room){
                response.notFound({                 
                    "type":"Error",
                    "title": "Recurso no encontrado",
                    "message": "El recurso de sala no pudo encontrarse",
                    "errors": [] 
                }) 
                return
                }
            await room.matches.push(match)
            await room.save()
        }catch(error){
            response.internalServerError({                 
                "type":"Error",
                "title": "Error de sevidor",
                "message": "Hubo un fallo en el servidor durante el registro de los datos",
                "errors": error
            })
            return
        }
    

        response.send({
            "type":"Exitoso",
            "title":"Recurso actualizado",
            "message":"Verificado exitosamente",
            "data":{
                room_code:room.room_code,
                game: room.game,
                room_privacy: room.room_privacy,
                matches:room.matches
            },
        })
    }


  public async addLooserMatch({ auth, params, response }: HttpContextContract) {
    const user = auth.user;
    if (!user) {
      response.notFound({
        "type": "Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de usuario no pudo encontrarse",
        "errors": []
      });
      return;
    }

    try {
      const room = await Room.findOneAndUpdate(
        { room_code: params.room_code, "matches.looser": 0 },
        { $set: { "matches.$.looser": user.id } },
        { new: true }
      );
      await room.save()

      if (!room) {
        response.notFound({
          "type": "Error",
          "title": "Recurso no encontrado",
          "message": "El recurso de sala o match no pudo encontrarse",
          "errors": []
        });
        return;
      }

      response.send({
        "type": "Exitoso",
        "title": "Recurso actualizado",
        "message": "Verificado exitosamente",
        "data": {
          room_code: room.room_code,
          game: room.game,
          room_privacy: room.room_privacy,
          matches: room.matches
        },
      });
    } catch (error) {
      response.internalServerError({
        "type": "Error",
        "title": "Error de servidor",
        "message": "Hubo un fallo en el servidor durante la actualización de los datos",
        "errors": error
      });
      return;
    }
  }

    
    public async updateStatistics({auth,params,response}: HttpContextContract) {
        
        const user = auth.user
        let wins= 0
        let looses= 0
        if(!user){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de usuario no pudo encontrarse",
                "errors": [] 
            }) 
            return
        }
        const room = await Room.findOne({room_code:params.room_code})
        if(!room){
            response.notFound({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "El recurso de sala no pudo encontrarse",
                "errors": [] 
            }) 
            return
            }
        try{
            const roomWinners = await Room.aggregate([
                { $match: {room_code:params.room_code} },
                { $unwind: "$matches" },
                { $group: { _id: "$matches.winner", wins: { $sum: 1 } } },
                { $sort: { wins: -1 } }
            ])

            const roomLoosers = await Room.aggregate([
                { $match: {room_code:params.room_code} },
                { $unwind: "$matches" },
                { $group: { _id: "$matches.looser", looses: { $sum: 1 } } },
                { $sort: { wins: -1 } }
            ])

            const game = await Game.query().where('name',room.game).first()
            if(!game){
                return
            }
            const userStatistics = await UserStatistic.query()
                .where('user_id',user.id)
                .where('game_id',game.id)
                .first()
            if(!userStatistics){
                return
            }
            roomWinners.forEach(async element => {
                if(element._id==user.id){

                    userStatistics.played_rounds += 1
                    
                    userStatistics.won_rounds = element.wins
                    
                    userStatistics.save()
                    wins++
                }
            })

            roomLoosers.forEach(async element => {
                if(element._id==user.id){
                    userStatistics.played_rounds += 1
                    
                    userStatistics.lost_rounds = element.looses
                    
                    userStatistics.save()
                    looses++
                }
            })

            if(params.winner&&params.winner==true){
                userStatistics.played_games ++
                userStatistics.won_games ++
            }
            if(params.winner&&params.winner==false){
                userStatistics.played_games ++
                userStatistics.lost_games ++
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
    
        response.send({
            "type":"Exitoso",
            "title":"Recurso actualizado",
            "message":"Estadisticas actualizadas exitosamente",
            "data":{
                wins:wins,
                looses:looses
            },
        })
    }
}
