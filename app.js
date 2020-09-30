const express = require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine','ejs');   

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);


mongoose.connect("mongodb://localhost:27017/todolistData"); 


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



const defaultItems =[item1, item2, item3];      

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

    Item.find({},function(err,founditems){ 
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
        item.save(); 
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
        Item.findByIdAndRemove(checkedId, function(err){ 
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
    

    List.findOne({name: titleName}, function(err, foundList){
        if(!err){
            if(!foundList){
                
                const list = new List({
                    name: titleName,
                    items: defaultItems
                });
                
                list.save();
                res.redirect("/" + titleName);  
            }
            else{
                
                res.render("list",{listTitle: foundList.name, newList: foundList.items}); 

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








