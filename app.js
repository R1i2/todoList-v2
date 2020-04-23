const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();
mongoose.connect("mongodb+srv://admin-rishav:Test123@cluster0-8hsya.mongodb.net/itemsDB");
const itemSchema= new mongoose.Schema({
    name:{
     type:String,
    requires:[true,"Why no name"]
}});
const Item=mongoose.model("Item",itemSchema);

const item=new Item({
    name:"This is a todo list"
});
const item1=new Item({
    name:"Press + add an item"
});
const item2=new Item({
    name:"<-- Click this to delete an item"
});

const listSchema=new mongoose.Schema({
    name:String,
    items:[itemSchema]
})
const List=mongoose.model("List",listSchema);

const defaultItem=[item,item1,item2];

app.use(express.static("public"));

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
   Item.find({},function(err,foundItems){
       if(foundItems.length===0)
       {
           Item.insertMany(defaultItem,function(err){
               if(err){
                   console.log(err)
               }
               else{
                   console.log("Successfully updated");
               }
           });
           res.redirect("/");
       }
       else
       {
           res.render("index",{listItem:"Today",Todo:foundItems});
       }
   })
});

app.get("/:customListName", function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,results){
        if(!err){
            if(!results)
            {
                const list = new List(
                {
                    name:customListName,
                    items:defaultItem
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                res.render("index",{listItem:results.name,Todo:results.items});    
            }
        }
    })
});

app.get("/about",function(req,res){
    res.render("about");
});

app.post("/",function(req,res)
{
    const itemName=req.body.newItem;
    const listName=req.body.button;

    const item = new Item
    ({
        name:itemName
     });

    if(listName === "Today"){
         item.save();
         res.redirect("/");     
    }
    else
    {
        List.findOne({name:listName},function(err,results)
        {
            results.items.push(item);
            results.save();
            res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
    const listName=req.body.newItem;
    if(listName === "Today")
    {
        Item.findByIdAndRemove(req.body.checkbox,function(err)
        {
            if(err){
                console.log(err);
            }
            else{
                console.log("successfully deleted");
                res.redirect("/");
            }
        })
    }
    else
    {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:req.body.checkbox}}},function(err,results){
            if(!err){
            res.redirect("/"+listName);
        }})
    }
});
app.listen(process.env.PORT,function(){
    console.log("port is on");
});