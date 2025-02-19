import SQLite from 'react-native-sqlite-storage'

const db = SQLite.openDatabase(
    {name: 'mydb.db', location: 'default'},
    () => console.log('Database opended'),
    error => console.log(error)
);

//function for the database calling
function createDatabase(): void{
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS shoppingCart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                krogerID INTEGER,
                name TEXT
            );` ,
            [],
            () => console.log('shoppingCart Table created successuflly'),
            error => console.log(error)
        );
    });
}

//call when initializing the app
createDatabase();