const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid AirPlay conflict
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const mongoose = require('mongoose');

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const User = require('./models/User');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('API Running (MongoDB Mode)');
});

// Auth Routes
app.post('/api/register', async (req, res) => {
    const { username, firstName, lastName, password, role, walletAddress } = req.body;
    try {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ message: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
        }

        const lowerWallet = walletAddress ? walletAddress.toLowerCase() : '';

        let query = [{ username }];
        if (lowerWallet !== '') {
            query.push({ walletAddress: lowerWallet });
        }

        const existingUser = await User.findOne({ $or: query });

        if (existingUser) {
            if (existingUser.username === username) return res.status(400).json({ message: 'Username already exists' });
            if (existingUser.walletAddress === lowerWallet) return res.status(400).json({ message: 'Wallet Address already linked to another account' });
        }

        const newUser = new User({
            username,
            firstName,
            lastName,
            password,
            role,
            walletAddress: lowerWallet
        });

        await newUser.save();

        res.json({ message: 'User registered successfully', user: { username: newUser.username, firstName: newUser.firstName, lastName: newUser.lastName, role: newUser.role, walletAddress: newUser.walletAddress } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

app.post('/api/login/metamask', async (req, res) => {
    const { walletAddress } = req.body;
    try {
        if (!walletAddress) return res.status(400).json({ message: 'Wallet address required' });

        const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

        if (!user) return res.status(404).json({ message: 'No account linked to this wallet' });

        res.json({
            message: 'Login successful',
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                walletAddress: user.walletAddress
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            user: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                walletAddress: user.walletAddress
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Info Route
app.get('/api/users/:address', async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.params.address.toLowerCase() });

        if (user) {
            res.json({ role: user.role, name: `${user.firstName} ${user.lastName}` || user.username });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded');

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ imageUrl, filename: req.file.filename });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send('Server Error: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
