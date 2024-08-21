import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Message } from '../../../start/mongoose'

export default class ChatsController {
    public async getChats({request, response}: HttpContextContract){
        const id_chat = request.qs().id
        const messages = await Message.find({chat_id:id_chat})
        response.send ({
            "type":"Exitoso",
            "title":"Recurso encontrado",
            "message":"El recurso de chat ha sido encontrado con exito",
            "data":messages,
          })
    }


}
