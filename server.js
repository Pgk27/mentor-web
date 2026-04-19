const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cho phép truy cập trực tiếp các file html/css/js trong thư mục project
app.use(express.static(__dirname));

function ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
}

function readUsers() {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    if (!raw) return [];
    return JSON.parse(raw);
}

function writeUsers(users) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

ensureDataFile();

// Trang chủ: mở luôn index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check để test nhanh server
app.get('/test', (req, res) => {
    res.status(200).send('Server OK');
});

// Lấy danh sách mentor
app.get('/api/users', (req, res) => {
    try {
        const users = readUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Loi doc users.json:', error);
        res.status(500).json({ message: 'Khong doc duoc du lieu' });
    }
});

// Thêm mentor mới
app.post('/api/users', (req, res) => {
    try {
        const users = readUsers();

        const newUser = {
            id: Date.now(),
            name: req.body.name || 'Mentor',
            role: req.body.role || 'Mentor',
            company: req.body.company || 'MentU',
            skills: Array.isArray(req.body.skills) ? req.body.skills : [],
            lang: req.body.lang || 'vn',
            avatar: req.body.avatar || ''
        };

        users.push(newUser);
        writeUsers(users);

        res.status(201).json({
            message: 'Luu thanh cong',
            user: newUser
        });
    } catch (error) {
        console.error('Loi ghi users.json:', error);
        res.status(500).json({ message: 'Khong luu duoc du lieu' });
    }
});

// Xóa mentor theo id
app.delete('/api/users/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const users = readUsers();

        const index = users.findIndex(user => Number(user.id) === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Khong tim thay mentor' });
        }

        const deletedUser = users[index];
        users.splice(index, 1);
        writeUsers(users);

        res.status(200).json({
            message: 'Da xoa mentor thanh cong',
            user: deletedUser
        });
    } catch (error) {
        console.error('Loi xoa mentor:', error);
        res.status(500).json({ message: 'Khong the xoa mentor' });
    }
});

// Nếu route không tồn tại nhưng là trang html thì trả về 404 rõ ràng
app.use((req, res) => {
    res.status(404).send('404 - Khong tim thay trang');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server dang chay tai cong ${PORT}`);
});

setInterval(() => {}, 1000);