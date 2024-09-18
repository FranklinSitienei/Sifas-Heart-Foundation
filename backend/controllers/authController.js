const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
// const { handleLoginAchievements } = require('../utils/achievementUtils');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password: bcrypt.hashSync(password, 10),
            lastLoginDate: new Date(),
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

        await sendEmail(email, 'Welcome to our Platform', 'Thank you for registering!');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Increment login count
        user.loginCount += 1;

        // Award badges for regular logins
        if (user.loginCount === 5 && !user.badges.some(b => b.title === 'Regular Visitor')) {
            user.badges.push({
                title: 'Regular Visitor',
                icon: '/images/log-in.png',
            });
        }

        if (user.loginCount === 10 && !user.badges.some(b => b.title === 'Dedicated User')) {
            user.badges.push({
                title: 'Dedicated User',
                icon: '/images/log-in1.png',
            });
        }

        user.lastLoginDate = new Date();

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
