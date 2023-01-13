//src/server.ts
import app from "./app";
import * as database from './config/database';

const db = new database.Database();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
    db.connectToDb();
})