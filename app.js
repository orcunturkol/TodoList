//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
})); +
-

mongoose.connect("mongodb://localhost:27017/toDoListDb", {
  useNewUrlParser: true
});
 
const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item", itemsSchema
);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model(
  "List", listSchema
);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  });
});

app.get("/:pageName", function(req, res) {
  const pageAdress = _.capitalize(req.params.pageName);
  List.findOne({name: pageAdress}, function(err, foundList) {
    if(!err){
      if(!foundList){
        //Create new list
        const list = new List({name:pageAdress, items:defaultItems});
        list.save();
        res.redirect("/" + pageAdress);
      }
      else{
        //Show an exist list
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res) {
  const item = req.body.newItem;
  const itemData = new Item({
    name: item
  });

  const listTitleName = req.body.list;

  if(listTitleName==="Today") {
    itemData.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listTitleName}, function(err, foundList){
      foundList.items.push(itemData);
      foundList.save();
      res.redirect("/"+listTitleName);
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedId, function(err) {
      if (!err) {
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedId}}}, function(err, foundItem){
      if(!err){
        res.redirect('/' + listName);
      }
    });
  }
});

const item1 = new Item({name:"Welcome to do list"});
const item2 = new Item({name:"You can create and delete items as you wish"});
const defaultItems = [item1, item2];


let port = process.env.PORT;
if (port == null || port==""){
  port = "3000";
}
app.listen(port, function(){
  console.log("Server has started successfully.")
})
