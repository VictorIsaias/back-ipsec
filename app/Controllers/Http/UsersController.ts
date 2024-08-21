
import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import User from 'App/Models/User';
const { createWriteStream, existsSync, mkdirSync } = require('fs')
import { join } from 'path'

export default class UsersController {
  public async index({request}: HttpContextContract) {

    var user: User[] 
    if(request.input('page')||request.input('limit')){
      const page = request.input('page',1)
      const limit = request.input('limit',3)
      user = await User.query()
        .paginate(page,limit)
    }else{
      user = await User.query()
    }

    return {
      "type":"Exitoso",
      "title":"Recursos encontrados",
      "message":"La lista de usuarios ha sido encontrada con exito",
      "data":user,
    }
  }
    public async register({request, response}: HttpContextContract){
        const body = request.all()

        await request.validate({
            schema: schema.create({
              name: schema.string.nullableAndOptional(),
              nickname: schema.string([
                rules.unique({table:'users',column:'nickname'})
              ]),
              lastname: schema.string.nullableAndOptional(),
              password: schema.string(),
              photo: schema.string.nullableAndOptional(),
              phone: schema.string.nullableAndOptional([
                  rules.phone(),
                  rules.unique({table:'users',column:'phone'})
              ]),
              email: schema.string([
                  rules.unique({table:'users',column:'email'}),
                  rules.email()
                ]),
                birthdate: schema.date.nullableAndOptional(),
              country: schema.string.nullableAndOptional(),
            }),
            messages: {
              'email.required': 'El correo electronico de la persona es obligatorio',
              'nickname.required': 'El nombre de usuario es obligatorio',
              'password.required': 'La contraseña es obligatoria',
              'email.unique': 'El correo electronico no esta disponible',
              'phone.unique': 'El numero de telefono no esta disponible',
              'nickname.unique': 'El nombre de usuario no esta disponible',
              'email.email': 'El formato del correo electronico no es valido',
              'birth_date.date.format': 'El formato de la fecha de nacimiento no es valida'
              }
          })

        const user = new User()
        try{
            user.email = body.email
            user.nickname = body.nickname
            user.password = body.password
            user.active = false
            if(body.birthdate){
              const birthdate = new Date(body.birthdate);
              const today = new Date();
        
              let age = today.getFullYear() - birthdate.getFullYear();
              const monthDiff = today.getMonth() - birthdate.getMonth();
              const dayDiff = today.getDate() - birthdate.getDate();
            
              if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
              }
              user.birthdate = body.birthdate
                
              user.age = age
            }
            if(body.phone){
                user.phone = body.phone
            }
            if(body.country){
                user.country = body.country
            }
            if(body.photo){
              const data = body.photo
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
                user.photo = fileName
            }
            if(body.name){
              user.name = body.name
            }
            if(body.lastname){
                user.lastname = body.lastname
            }
            await user.save()

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
        "message":"El recurso usuario ha sido creado exitosamente",
        "data":user,
      })
    }
    
    public async show({response,auth}: HttpContextContract){
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
        response.status(200)
        response.send ({
            "type":"Exitoso",
            "title":"Datos encontrados",
            "message":"Usuario recuperado correctamente",
            "data":{
              name:user.name,
              lastname:user.lastname,
              nickname:user.nickname,
              email:user.email,
              photo:user.photo,
              phone:user.phone,
              country:user.country,
              age:user.age,
              birthdate:user.birthdate,
              active:user.active
            }
        })
    }

    
  public async update({auth,request,response}: HttpContextContract) {
    
    const body = request.all()

    var user = auth.user
    if(!user){
      response.notFound({                 
          "type":"Error",
          "title": "Recurso no encontrado",
          "message": "El recurso de usuario no pudo encontrarse",
          "errors": [] 
      })
      return
    }
    await request.validate({
        schema: schema.create({
            name: schema.string.nullableAndOptional(),
            nickname: schema.string.nullableAndOptional([
              rules.unique({table:'users',column:'nickname'})
            ]),
            lastname: schema.string.nullableAndOptional(),
            password: schema.string.nullableAndOptional(),
            photo: schema.string.nullableAndOptional(),
            phone: schema.string.nullableAndOptional([
                rules.phone(),
                rules.unique({
                  table: 'users',
                  column: 'phone',
                  whereNot: {
                      id: user.id
                  }
              })
            ]),
            email: schema.string.nullableAndOptional([
                rules.unique({
                  table: 'users',
                  column: 'email',
                  whereNot: {
                      id: user.id
                  }
              }),
                rules.email()
              ]),
            birthdate: schema.date.nullableAndOptional(),
            country: schema.string.nullableAndOptional(),
          }),
        messages: {
            'email.unique': 'El correo electronico no esta disponible',
            'phone.unique': 'El numero de telefono no esta disponible',
            'nickname.unique': 'El nombre de usuario no esta disponible',
            'email.email': 'El formato del correo electronico no es valido',
            'birth_date.date.format': 'El formato de la fecha de nacimiento no es valida'
        }
      })


    try{
      if(body.name){
        user.name = body.name
      }
      if(body.lastname){

        user.lastname = body.lastname
      }
      if(body.birthdate){
        const birthdate = new Date(body.birthdate);
        const today = new Date();
  
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();
        const dayDiff = today.getDate() - birthdate.getDate();
      
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
        
        user.age = age
        user.birthdate = body.birthdate
      }
      if(body.phone){
        user.phone = body.phone
      }
      if(body.email){
        user.email = body.email
      }
      if(body.photo){
        const media = body.photo
        const uploadPath = join(Application.tmpPath('uploads'))
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath)
        }
    
        const base64Data = media.split(';base64,').pop()
        const extension = media.match(/\/(.*?);/)?.[1] || 'bin' // Default to 'bin' if extension can't be determined
        const finalFileName = `FILE-${new Date().getTime()}.${extension}`
        const filePath = join(uploadPath, finalFileName)
    
        const buffer = Buffer.from(base64Data, 'base64')
    
        try {
          await new Promise((resolve, reject) => {
            const stream = createWriteStream(filePath)
            stream.write(buffer)
            stream.end()
            stream.on('finish', resolve)
            stream.on('error', reject)
          })
    
          user.photo = finalFileName
        } catch (error) {
          console.error('Error saving file:', error)
        }
      }
      if(body.password){
        user.password = body.password
      }
      if(body.country){
        user.country = body.country
      }
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

  public async destroy({response,auth}: HttpContextContract) {

    const user = auth.user

    if(user){

      await user.delete()
      await user.related('userStatistics').query().delete()

      response.send ({
        "type":"Exitoso",
        "title":"Recurso eliminado",
        "message":"El recurso usuario ha sido eliminado exitosamente",
        "data":user,
      })
    }
    else{
      response.notFound({                 
        "type":"Error",
        "title": "Recurso no encontrado",
        "message": "El recurso de usuario no pudo encontrarse",
        "errors": [] 
      })
    }

  }

  
}
