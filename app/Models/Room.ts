
import {mongoose} from '../../start/mongoose'

export const Room = mongoose.model('room', new mongoose.Schema({
  room_code: Number,
  host_player: Number,
  invited_players: [Number],
  room_privacy: String,
  game:Number,
  matches: [{
    match_number: Number,
    looser: Number,
    winner: Number,
  }]
}))