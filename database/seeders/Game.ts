import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Game from 'App/Models/Game'

export default class extends BaseSeeder {
  public async run () {
    await Game.createMany([
        {name:"Tres en raya",image:"Tic-Tac-Toe.jpg",description:"El tres en línea, también conocido como tres en raya es un juego de lápiz y papel entre dos jugadores: O y X, que marcan los espacios de un tablero de 3×3 alternadamente.",rules:"Cada jugador solo debe colocar su símbolo una vez por turno y no debe ser sobre una casilla ya jugada. En caso de que el jugador haga trampa el ganador será el otro. Se debe conseguir realizar una línea recta o diagonal por símbolo."},
        {name:"Loteria",image:"Loteria-1.png",description:"La lotería o loto​ es un juego de apuestas que puede ser desarrollado de modo abierto al público mediante billetes y sorteos o desarrollado como juego de mesa que consiste en cartones y barajas.",rules:"El objetivo consiste en ir llenando con fichas el cartón asignado, el cual está conformado por diversas figuras, según vayan pregonando la persona encargada de sacar y cantar las cartas del mazo. Quien complete su cartón primero, gana, en cada hogar existen reglas especificas para determinar el ganador."}
      ])
  }
}
