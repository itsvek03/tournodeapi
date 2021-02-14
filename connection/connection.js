// Importing file 
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/tourdb",
        {useNewUrlParser:true,
        useCreateIndex:true,
        useUnifiedTopology:true,
        useFindAndModify:false
}).then(() =>{console.log('Connection successfully')})
  .catch((err) =>{console.log(err)})
