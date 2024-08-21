import Ws from 'App/Services/Ws'

Ws.boot()

Ws.io.on('connection', (socket) => {

  socket.on('data:emit', async (data) => {
    console.log(data)
    switch(data.type){
        // Solicitud que envia un usuario cualquiera
        case "requestJoinRoom":
            if(data.privacy=="private"){
                socket.emit('room:listen',{
                    room_code:data.room_code,
                    type:"requestJoin",
                    user_code:data.user_code,
                    nickname:data.nickname
                })
                socket.broadcast.emit('room:listen',{
                    room_code:data.room_code,
                    type:"requestJoin",
                    user_code:data.user_code,
                    nickname:data.nickname
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
                user:data.user_code,
                answer:data.answer
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"responseJoin",
                user:data.user_code,
                answer:data.answer
            })
            break
        // Confirmacion que envia el jugador que hizo la solicitud para reenviar datos de usuario
        case "confirmJoinRoom":
            socket.emit('room:listen',{
                room_code:data.room_code,
                type:"confirmJoin",
                user:data.user_code,
                nickname:data.nickname,
                photo:data.photo,
                country:data.country
            })
            socket.broadcast.emit('room:listen',{
                room_code:data.room_code,
                type:"confirmJoin",
                user:data.user_code,
                nickname:data.nickname,
                photo:data.photo,
                country:data.country
            })
            break
    }
  })


  socket.on('game:emit', async (data) => {
    switch(data.game){
        case "tiktaktoe":
            switch(data.type){
                case "move":
                    socket.emit('game:listen',{
                        room_code:data.room_code,
                        type:"move",
                        user:data.user_code,
                        position:data.position
                    })
                    socket.broadcast.emit('game:listen',{
                        room_code:data.room_code,
                        type:"move",
                        user:data.user_code,
                        position:data.position
                    })
                    break
            }
            break
        case "lottery":
            
            break
    }
  })
})
