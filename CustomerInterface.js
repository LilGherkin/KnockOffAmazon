const inquirer = require("inquirer");
const mysql = require("mysql");
var connection = mysql.createConnection({
    host : "localhost",
    port: 3306,
    user: "root",
    password: "TopSecretPasswordThatI'veEnteredInHereInsteadOfMyRealPassword",
    database: "bamazon"
});


//Flag to see if we've run the Connect function yet. 

//Connect us to our server
function Connect(){
    connection.connect((err) => {
        if (err) throw err;
        //If it didn't error out then return all rows in our table
        Actions();
    });
};

function CheckInventory(){
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;
        //console.table formats it as a table. Ain't that neat. 
        console.table(res);
        Actions();
    });
};

function Actions() {
    inquirer.prompt([
        {
            name: "Request",
            type: "list",
            message: "What would you like to do?",
            choices: ["Check Inventory", "Make A Purchase", "Exit"]
        }
    ])
    .then(answers => {
        if (answers.Request === "Check Inventory"){
            CheckInventory();
        } else if (answers.Request === "Make A Purchase") {
            CheckInventory2();
        } else {
            console.log("Thank you. Come again.");
            connection.end();
        }       
    });
};

function CheckInventory2(){
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;
        //console.table formats it as a table. Ain't that neat. 
        console.table(res);
        PurchaseMaker();
    });
};


function PurchaseMaker() {
    inquirer.prompt([
        {
            name: "id",
            type: "number",
            message: "Enter the ID of the item you'd wish to purchase."  
        }, {
            name: "units",
            type: "number",
            message: "How many would you like to purchase?"
        }
    ]).then(function(answer){
        connection.query(
            //Utilizing template literals to grab data from our table.
            `SELECT * FROM products WHERE ITEM_id=${answer.id}`,
            function(err, res){
                if (err) throw err;
                //Console table is fantastic.
                console.table(res);
                //res[0] because it is returned as an array of objects and we need the first item in the array. Check to see if there's enough.
                if (answer.units <= res[0].STOCK_QUANTITY) {
                    //Set an amount to reduce by.
                    var ReduceQuantity = res[0].STOCK_QUANTITY - answer.units;
                    //How much will it all cost?
                    var PriceCalculation = res[0].CUSTOMER_COST * answer.units;
                    //Send a request to the connection to update products set
                    connection.query(
                        `UPDATE products SET ? WHERE ?`,
                        [
                            {
                                STOCK_QUANTITY: ReduceQuantity
                            }, {
                                ITEM_ID: answer.id
                            }
                        ],
                        (err) => {
                            if (err) throw err;
                            //Message to return when there is now error. Returns the amount of an item purchased 
                            console.log(`Purchasing ${answer.units} units of ${res[0].PRODUCT_NAME} for $${PriceCalculation}! Thank you for your purchase!` + '\n') ;
                            //Run Actions again to see if they want to do anything else.
                            Actions();
                            
                        }
                    );
                //There wasn't enough. 
                } else {
                    connection.end();
                    return console.log(`Sorry, we can't fulfill that order at that quantity!`);                  
                }
            }
        );
    });
};
//Initializes the program. 
Connect();