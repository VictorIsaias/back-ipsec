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
}).prefix('/auth')


Route.group(() =>{
  Route.post('/', 'UsersController.register')
  Route.get('/', 'UsersController.show').middleware("auth:api")
  Route.put('/', 'UsersController.update').middleware("auth:api")
}).prefix('/user')