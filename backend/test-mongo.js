const mongoose = require('mongoose');

const uri = "mongodb+srv://shivam999876_db_user:Shivam%402025@cluster0.owcnqbm.mongodb.net/taskflow?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
