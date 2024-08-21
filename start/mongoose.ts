export const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://isaiascastrejonrdz:lapisasyes@cluster0.zphlh4l.mongodb.net/Bluelog?retryWrites=true&w=majority&appName=Cluster0',
  { serverApi: { version: '1', strict: true, deprecationErrors: true } });
  await mongoose.connection.db.admin().command({ ping: 1 });
}
const chats = new mongoose.Schema({
  chat_id: Number,
  username: String,
  message: String,
  date: String,
  media: String,
  answer: {
    username: String,
    message: String,
    date: String,
    media: String,
  }
});
export const Message = mongoose.model('message', chats);