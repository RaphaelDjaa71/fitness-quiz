const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/fitness-quiz', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function findUser() {
    try {
        const user = await User.findOne({ email: 'laser_messie.9p@icloud.com' });
        console.log('User found:', JSON.stringify(user, null, 2));
    } catch (error) {
        console.error('Error finding user:', error);
    } finally {
        mongoose.connection.close();
    }
}

findUser();
