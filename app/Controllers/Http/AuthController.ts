import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import mailer from 'App/Services/Mailer';
import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios';

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
            if(!user.active){
                response.unauthorized({                 
                    "type":"Error",
                    "title": "Sin autorizacion",
                    "message": "El usuario no ha verificado su cuenta",
                    "errors": [] 
                })
                return
            }
            
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


    
    public async sendCode({request,response}: HttpContextContract) {
 
        const body = request.all()
        const email = body.email

        await request.validate({
            schema: schema.create({
                email: schema.string([
                    rules.email()
                ]),
            }),
            messages: {
                'email.required': 'Ingresa un correo electronico o nombre de usuario para iniciar sesion'
                }
            })

        const user = await User.query().where("email",email).first()
        if(!user){
            response.notFound({                 
                "type":"Error",
                "title": "Usuario no encontrado",
                "message": "El correo electronico es incorrecto",
                "errors": []
              })
              return
        }
        var code = ""
        for (let i = 0; i < 5; i++) {
          code += Math.floor(Math.random() * 10).toString();
        }
        user.code = code

        const emailData = {
            code: code
        }

        const mail = await mailer.sendMailCode(emailData,"Codigo de autenticación",email)
        if(!mail){
            response.internalServerError({                 
                "type":"Error",
                "title": "Error de sevidor",
                "message": "Hubo un fallo en el servidor durante el envio de los datos",
                "errors": []
              })
              return
        }
        await user.save()

        response.status(200)
        response.send ({
            "type":"Exitoso",
            "title":"Email enviado",
            "message":"Email enviado correctamente",
            "data":{}
        })

    }

    
    public async authenticate({request,response}: HttpContextContract) {
        const body = request.all()
        const email = body.email
        const code = body.code
        const user = await User.query().where("email",email).first()
        if(!user){
            response.notFound({                 
                "type":"Error",
                "title": "Usuario no encontrado",
                "message": "El correo electronico es incorrecto",
                "errors": []
              })
              return
        }

        if(user.active){
            response.badRequest({                 
                "type":"Error",
                "title": "Usuario activo",
                "message": "El usuario ya ha sido verificado",
                "errors": []
              })
              return
        }

        if(code != user.code){
            response.badRequest({                 
                "type":"Error",
                "title": "Codigo incorrecto",
                "message": "El codigo ingresado no es correcto",
                "errors": []
              })
              return
        }

        user.code = null
        user.active = true
        await user.save()
        
        const emailData = {
            fullname: user.name +" "+ user.lastname,
            title: "Tu cuenta de Bluelog ha sido verificada correctamente",
            content: "Disfruta de tu nuevo perfil en Bluelog, prueba subir algo a tu blog!"
        }

        await mailer.sendMailConfirmation(emailData,"Cuenta verificada",email)

        response.status(200)
        response.send ({
            "type":"Exitoso",
            "title":"Usuario verificado",
            "message":"Usuario verificado correctamente",
            "data":{}
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

    public async verifyRecaptcha({response,request}: HttpContextContract){
        const token = request.input('token');
        const secretKey = Env.get('CAPTCHA_KEY');
      
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
      
        const result = await axios.post(verificationUrl)
      
        if(result.data.success=="true"){
            response.unauthorized({                 
                "type":"Error",
                "title": "Token incorrecto",
                "message": "El token ingresado no es correcto",
                "errors": result.data
              })
              return
        }

        response.status(200)
        response.send ({
            "type":"Exitoso",
            "title":"Token verificado",
            "message":"El token ha sido verificado correctamente",
            "data":"true"
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
