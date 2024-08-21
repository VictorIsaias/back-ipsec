/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.get('/get-chat', 'ChatsController.getChats')

Route.get('/countries', 'CountriesController.getCountries')

Route.group(() =>{
  Route.post('/login', 'AuthController.login')
  Route.post('/logout', 'AuthController.logout').middleware("auth:api")
  Route.post('/send-code', 'AuthController.sendCode')
  Route.post('/verify-account', 'AuthController.authenticate')
  Route.post('/verify-recaptcha', 'AuthController.verifyRecaptcha')
  Route.put('/correct-email', 'UsersController.updateEmail')
}).prefix('/auth')

Route.group(() =>{
  Route.post('/', 'UsersController.register')
  Route.get('/', 'UsersController.show').middleware("auth:api")
  Route.put('/', 'UsersController.update').middleware("auth:api")
}).prefix('/user')

Route.group(() =>{
  Route.get('/', 'UserStatisticsController.index')
  Route.post('/:game_id', 'UserStatisticsController.store')
  Route.get('/:game_id', 'UserStatisticsController.show')
  Route.put('/:game_id', 'UserStatisticsController.update')
  Route.delete('/:game_id', 'UserStatisticsController.destroy')
  Route.get('/game-ranking/:game_id', 'UserStatisticsController.showGameRanking')
}).prefix('/user-statistics').middleware("auth:api")

Route.group(() =>{
  Route.get('/', 'GamesController.index')
  Route.post('/', 'GamesController.store')
  Route.get('/:game_id', 'GamesController.show')
  Route.put('/:game_id', 'GamesController.update')
  Route.delete('/:game_id', 'GamesController.destroy')
}).prefix('/games').middleware("auth:api")

Route.group(() =>{
  Route.post('/', 'RoomsController.create')
  Route.get('/:room_code', 'RoomsController.show')
  Route.put('/:room_code', 'RoomsController.update')
  Route.post('/join/:room_code', 'RoomsController.joinRoom')
  Route.post('/verify/:room_code', 'RoomsController.verifyRoomAccess')
  Route.post('/winner/:room_code', 'RoomsController.addWinnerMatch')
  Route.post('/looser/:room_code', 'RoomsController.addLooserMatch')
  Route.put('/statistics/:room_code/:winner', 'RoomsController.updateStatistics')
}).prefix('/room').middleware("auth:api")