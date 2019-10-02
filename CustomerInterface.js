const inquirer = require("inquirer");
const mysql = require("mysql");
var connection = mysql.createConnection({
    host : "localhost",
    port: 3306,
    user: "root",
    password: "This isn't my password, you'd want to use your own. Github repo.",
    database: "bamazon"
});

connection.connect((err) => {
    if (err) throw err;

    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;
        console.table(res);
        purchasePrompt();
    });

});


function purchasePrompt() {
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the id of the item you would like to buy?",
            validate: (value) => {
                return !isNaN(value);
            }
        }, {
            name: "units",
            type: "input",
            message: "How mmuch of this product would you like to buy?",
            validate: (value) => {
                return !isNaN(value);
            }
        }
    ]).then((answer) => {

        connection.query(
            `SELECT * FROM products WHERE ITEM_id=${answer.id}`,
            (err, res) => {
                if (err) throw err;

                console.table(res);

                if (answer.units <= res[0].STOCK_QUANTITY) {

                    var maths = res[0].STOCK_QUANTITY - answer.units;
                    var PriceCalculation = res[0].CUSTOMER_COST * answer.units;
                    connection.query(
                        `UPDATE products SET ? WHERE ?`,
                        [
                            {
                                STOCK_QUANTITY: maths
                            }, {
                                ITEM_ID: answer.id
                            }
                        ],
                        (err) => {
                            if (err) throw err;

                            console.log(`Purchasing ${answer.units} units of ${res[0].PRODUCT_NAME} for $${PriceCalculation}! Thank you for your purchase!`);

                        }
                    );
                } else {
                    connection.end();
                    return console.log(`Insufficient quantity!`);
                    
                }

                connection.end();

            }
        );

    });
}