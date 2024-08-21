import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getCountries } from 'node-countries'

export default class CountriesController {
    public async getCountries({}: HttpContextContract) {

        const countries = getCountries()

        return {
            "type":"Exitoso",
            "title":"Recursos encontrados",
            "message":"La lista de recursos de paises ha sido encontrada con exito",
            "data":countries,
        }
    }
}
