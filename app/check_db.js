import db from './src/config/database.js';

const check = async () => {
    try {
        console.log("Checking database content...");
        const users = await db.getAsync('SELECT count(*) as c FROM usuarios');
        const plants = await db.getAsync('SELECT count(*) as c FROM plantas');
        console.log(`Users: ${users.c}`);
        console.log(`Plants: ${plants.c}`);
    } catch (e) {
        console.error(e);
    }
};

check();
