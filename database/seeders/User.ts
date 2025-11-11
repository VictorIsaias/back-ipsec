import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    await User.createMany([
    {email:'pedrito.silva@gmail.com',active:true,password:'contrasena2',nickname:"pedrito",phone:"528714446302",name:"Pedro",lastname:"Silva"},
    {email:'miller.viktor@gmail.com',active:true,password:'contrasena3d',nickname:"miller",phone:"528714446303",name:"Victor",lastname:"Cabello"},
    {email:'roberto.angel@gmail.com',active:true,password:'contrasena4',nickname:"ibañez",phone:"528714446304",name:"Roberto",lastname:"Ibañez"},
    {email:'isaias.castrejonrdz@gmail.com',active:true,password:'contrasena5',nickname:"vic2",phone:"528714446305",name:"Victor",lastname:"Rodriguez"},
    ])
  }
}
