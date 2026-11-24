if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const classifyRoutes = require('./routes/classifyRoutes');
const statusRoutes = require('./routes/statusRoutes');
const answerRoutes = require('./routes/answerRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/complaints', classifyRoutes);
app.use('/api/complaints', statusRoutes);
app.use('/api/complaints', answerRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.json({ message: '민원 시스템 서버 실행중!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행중: ${PORT}번 포트`);
});