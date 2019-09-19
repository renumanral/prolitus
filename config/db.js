var mysql = require('mysql');
var db;

function connectDatabase() {

if (!db) {
  db = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'renu@123',
database: 'official',
connectTimeout: 60000
});

db.connect(function (err) {
if (!err) {
console.log('Database is connected!');
} else {
console.log('Error connecting database!', err);
throw err;
}
});
}
return db;
}

module.exports = connectDatabase();