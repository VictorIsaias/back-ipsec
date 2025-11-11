import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {

    public async login({request,response,auth}: HttpContextContract) {
 
        const body = request.all()

        await request.validate({
        schema: schema.create({
            password: schema.string(),
            input: schema.string(),
        }),
        messages: {
            'password.required': 'La contraseña de la persona es obligatoria para iniciar sesion',
            'input.required': 'Ingresa un correo electronico o nombre de usuario para iniciar sesion'
            }
        })
        let token,user

        try{
            token = await auth.use('api').attempt(body.input,body.password)
            
            if(!token){
                response.badRequest({                 
                    "type":"Error",
                    "title": "Recurso no encontrado",
                    "message": "Alguno de los datos ingresados son incorrectos",
                    "errors": [] 
                })
                return
            }            
            user = auth.user;
            
            const password_hash = user.password.toString()
            
            if(!await Hash.verify(password_hash,body.password)){
                response.badRequest({                 
                    "type":"Error",
                    "title": "Recurso no encontrado",
                    "message": "Alguno de los datos ingresados son incorrectos",
                    "errors": [] 
                })
                return
            }

        }catch(error){
            response.badRequest({                 
                "type":"Error",
                "title": "Recurso no encontrado",
                "message": "Alguno de los datos ingresados son incorrectos",
                "errors": error
            })
            return
        }
        
        response.status(200)
        response.send ({
            "type":"Exitoso",
            "title":"Sesion iniciada",
            "message":"Sesion iniciada correctamente",
            "data":user,
            "token":token
        })
    }


    public async logout({response,auth}: HttpContextContract){
        await auth.logout()
        response.status(200)
        response.send ({
            "type":"Exitoso",
            "title":"Sesion cerrada",
            "message":"Sesion cerrada correctamente",
            "data":{}
        })
    }

    public async updateEmail({response,request}: HttpContextContract){
  
        const body = request.all()

        await request.validate({
            schema: schema.create({
                email: schema.string(),
                newEmail: schema.string([
                    rules.unique({table:'users',column:'email'}),
                    rules.email()
                  ])
              }),
            messages: {
                'email.required': 'El correo electronico de la persona es obligatorio',
                'newEmail.unique': 'El correo electronico no esta disponible',
                'newEmail.required': 'El correo electronico de la persona es obligatorio',
               }
          })
    
        var user = await User.query().where('email',body.email).first()
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

        user.email = body.newEmail
        user.save()
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
          "message":"El recurso usuario ha sido actualizado exitosamente",
          "data":user,
        })
        
    }
}
