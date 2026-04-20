const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI || 'mongodb://YourMongoAdmin:1234@localhost:27017/admin';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Подключено к MongoDB'))
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err.message);
    process.exit(1);
  });


const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    age:        { type: Number, required: true, min: 0 },
    created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updated_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  },
  { versionKey: false }
);


userSchema.index({ last_name: 1 });

const User = mongoose.model('User', userSchema);


app.post('/api/users', async (req, res) => {
  const { first_name, last_name, age } = req.body;
  if (!first_name || !last_name || age === undefined) {
    return res.status(400).json({ error: 'Поля first_name, last_name, age обязательны' });
  }
  try {
    const user = new User({ first_name, last_name, age });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.patch('/api/users/:id', async (req, res) => {
  const updates = { ...req.body, updated_at: Math.floor(Date.now() / 1000) };
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("server started on http://localhost:3000")
})
