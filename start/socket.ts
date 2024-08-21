import Ws from 'App/Services/Ws'
import Application from '@ioc:Adonis/Core/Application'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { Message } from './mongoose'

Ws.boot()

/**
 * Listen for incoming socket connections
 */

Ws.io.on('connection', (socket) => {


  socket.on('data:emit', async (data) => {
    switch(data.type){
        // Solicitud que envia un usuario cualquiera
        case "requestJoinRoom":
            if(data.privacy=="private"){
                socket.emit('room:listen',{
                    room_code:data.room_code,
                    type:"requestJoin",
                    user_code:data.user_code,
                    nickname:data.nickname,
                    game_id:data.game_id
                })
                socket.broadcast.emit('room:listen',{
                    room_code:data.room_code,
                    type:"requestJoin",
                    user_code:data.user_code,
                    nickname:data.nickname,
                    game_id:data.game_id
                })
            }else if(data.privacy=="public"){

            }
            break
        // El host empieza el juego manualmente
        case "beginGame":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"beginGame"
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"beginGame"
            })
            break
        // El host termina el juego al llegar a cierto numero de rondas o sea cual sea la condicion
        case "endGame":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"endGame",
                winner_code:data.winner_code,
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"endGame",
                winner_code:data.winner_code,
            })
            break
         // El host empieza la ronda despues de cierto tiempo de terminada la anterior
        case "beginMatch":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"beginGame",
                player_x_code:data.player_x_code,
                player_o_code:data.player_o_code,
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"beginGame",
                player_x_code:data.player_x_code,
                player_o_code:data.player_o_code,
            })
            break
        // El host termina la ronda cuando hay un ganador
        case "endMatch":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"endMatch",
                winner_code:data.winner_code,
                lost_code:data.lost_code,
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"endMatch",
                winner_code:data.winner_code,
                lost_code:data.lost_code,
            })
            break
        // Respuesta que envia el host
        case "answerJoinRoom":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"responseJoin",
                user_code:data.user_code,
                answer:data.answer
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"responseJoin",
                user_code:data.user_code,
                answer:data.answer
            })
            break
        // Confirmacion que envia el jugador que hizo la solicitud para reenviar datos de usuario
        case "confirmJoinRoom":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"confirmJoin",
                user_code:data.user_code,
                nickname:data.nickname,
                photo:data.photo,
                country:data.country
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"confirmJoin",
                user_code:data.user_code,
                nickname:data.nickname,
                photo:data.photo,
                country:data.country
            })
            break
        case "cancelJoinRoom":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"cancelJoin",
                user_code:data.user_code,
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"cancelJoin",
                user_code:data.user_code,
            })
            break
        case "requestGameInfo":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"requestInfo",
                user_code:data.user_code
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"requestInfo",
                user_code:data.user_code
            })
            break
        case "responseGameInfo":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"responseInfo",
                user_code:data.user_code,
                data:data.data
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"responseInfo",
                user_code:data.user_code,
                data:data.data
            })
            break
    }
  })


  socket.on('game:emit', async (data) => {
    switch(data.game){
        case 1:
            switch(data.type){
                case "move":
                    socket.emit('game:listen',{
                        room_code:data.room_code,
                        type:"move",
                        user_code:data.user_code,
                        board:data.board
                    })
                    socket.broadcast.emit('game:listen',{
                        room_code:data.room_code,
                        type:"move",
                        user_code:data.user_code,
                        board:data.board
                    })
                    break
            }
            break
        case 2:
            case 1:
                switch(data.type){
                    case "winner":
                        socket.emit('game:listen',{
                            room_code:data.room_code,
                            type:"winner",
                            winner:data.winner
                        })
                        socket.broadcast.emit('game:listen',{
                            room_code:data.room_code,
                            type:"winner",
                            winner:data.winner
                        })
                        break
                    case "endGame":
                        socket.emit('game:listen',{
                            room_code:data.room_code,
                            type:"endGame",
                            winners:data.winners
                        })
                        socket.broadcast.emit('game:listen',{
                            room_code:data.room_code,
                            type:"endGame",
                            winners:data.winners
                        })
                        break
                    case "newCard":
                        socket.emit('game:listen',{
                            room_code:data.room_code,
                            type:"newCard",
                            card:data.card
                        })
                        socket.broadcast.emit('game:listen',{
                            room_code:data.room_code,
                            type:"newCard",
                            card:data.card
                        })
                        break
                }
                break
            break
    }
  })










  var chat_id:number = 0
  
  socket.on('chat', async (data) => {
    chat_id = data
  })

  socket.on('data', async (data) => {
    const message = new Message({
      chat_id:chat_id,
      username:data.username,
      date:data.date,
      message:data.message
    
    })
    if (data.answer){
      message.answer = data.answer
    }
    if (data.media) {
      const base64Data = data.media.split(';base64,').pop()
      const extension = data.media.match(/\/(.*?);/)?.[1] || 'bin' // Default to 'bin' if extension can't be determined
      const fileName = `FILE-${new Date().getTime()}.${extension}`
      const filePath = join(Application.tmpPath('uploads'), fileName)

      const buffer = Buffer.from(base64Data, 'base64')

      try {
        await new Promise((resolve, reject) => {
          const stream = createWriteStream(filePath)
          stream.write(buffer)
          stream.end()
          stream.on('finish', resolve)
          stream.on('error', reject)
        })
      } catch (error) {
        console.error('Error saving file:')
        return
      }
      
      data.media = fileName
      message.media = data.media
    }

    
    console.log(data)
    socket.emit('messages',data)
    socket.broadcast.emit('messages',data)
    await message.save()
  })
})
