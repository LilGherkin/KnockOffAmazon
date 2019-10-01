const inquirer = requre("inquirer");
const mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "#1tWOthRee",
    database: "bamazon"
});

