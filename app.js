const express = require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine','ejs');   // Tell the code to use EJS

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
// Implementing a DataBase //

mongoose.connect("mongodb://localhost:27017/todolistData"); // Only used as Local Storage
// For Atlas: mongoose.connect("mongodb+srv://admin-pranshu:sampledata123@cluster0-7wubs.mongodb.net/todolistData");        // For cloud Connectivity
// Creating a schema 

const itemsSchema = new mongoose.Schema({
    name: String
});

// Creating a model

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name: "Welcome to your todoList!"
});

const item2 = new Item({
    name: "Hit the + Icon to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

// Inserting stuff

const defaultItems =[item1, item2, item3];      // Array to store items 1-3

// New Schema:

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

// End of DBase//


// Server Code:

app.get("/", function(req,res){

    // Finding the data in DBase:

    Item.find({},function(err,founditems){ // {}--> Means find all 
    // To make sure items are not added again and again
        if(founditems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("default items are added!");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: "Today", newList: founditems}); // {key: value} , Data will put in the item
        }
        // console.log(founditems);
    });

    
})



app.post("/",function(req,res){
    // Outputing list additions using Mongoose

    let itemName =req.body.newItem;
    let listName = req.body.list;

    const item = new Item({
        name: itemName
    });
   
    if(listName === "Today"){
        item.save(); // Instead of using insert method
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" +listName)
        });
    }
    
})




app.post("/delete",function(req,res){
    const checkedId=req.body.checkers;
    const listName =req.body.listed;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedId, function(err){ // Find using Id and then remove data
            if(!err){
                console.log("Succesfully deleted Item");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items :{_id: checkedId}}},function(err,findList){
            if(!err){
                res.redirect("/" +listName)
            }
        });
    }

    
})




app.get("/:title",function(req,res){
    const titleName = _.capitalize(req.params.title);
    // Check if titleName already exists.

    List.findOne({name: titleName}, function(err, foundList){
        if(!err){
            if(!foundList){
                // console.log("Doesn't exists");
                // Create a New List
                const list = new List({
                    name: titleName,
                    items: defaultItems
                });
                
                list.save();
                res.redirect("/" + titleName);  // redirect on a custom page
            }
            else{
                // console.log("Name occupied");
                // Show an existing List
                res.render("list",{listTitle: foundList.name, newList: foundList.items}); // {key: value} , Data will put in the item

                }
            }
    });

})



// app.post("/work",function(req,res){
//     let item =req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })


app.listen(process.env.PORT || 3000, function(){
    console.log("Server started at Port 3000");
})













// app.get("/", function(req,res){
    
    // Code to check if today is weekend or not

    // var today = new Date();            // Date obj
    // var today = today.getDay();     // old code
    // var whatDay ="";    //value

//     if(today.getDay() === 6 || today.getDay() === 0) //getDate is used to getDate in number
//     {
//         whatDay ="Weekend";
//     }

//     else{
//         whatDay ="Weekday";
//     }


// To check what day it is

// switch (today) {
//     case 0:
//         whatDay = "Sunday";

//         break;

//     case 1:
//         whatDay = "Monday";
        
//         break;

//     case 2:
//         whatDay = "Tuesday";
        
//         break;

//     case 3:
//         whatDay = "Wednesday";
    
//         break;
//     case 4:
//         whatDay = "Thursday";
    
//         break;
//     case 5:
//         whatDay = "Friday";
    
//         break;
//     case 6:
//         whatDay = "Saturday";
    
//         break;

//     default:
//         console.log("Wong case");
// }