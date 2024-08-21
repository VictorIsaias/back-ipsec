import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule('phone', (value, _, options) => {

    var count=0

    for (const l of value) {
      if (isNaN(parseInt(l))){
        options.errorReporter.report(
          options.pointer,
          'phone.format',
          'El numero de telefono debe ser una serie de digitos',
          options.arrayExpressionPointer
        )
        return
      }
      count++
    }
      if(count>15){
          options.errorReporter.report(
              options.pointer,
              'phone.format',
              'El numero de telefono debe de tener 10 digitos e incluir su codigo de pais',
              options.arrayExpressionPointer
          )
          return
       }
  })