const mongoose = require("mongoose");

const thingShema = mongoose.Schema({
    title :{type:String , required: true},
    description:{type:String , required: true},
    imageUrl:{type:String , required: true},
    userId:{type:String , required: true},
    prive:{type:Number , required: true},
});

module.exports = mongoose.model('things', thingShema);