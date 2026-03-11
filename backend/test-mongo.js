import mongoose from 'mongoose';

const uri = "mongodb+srv://tsasi9328_db_user:WJPanD3n4s687SeQ@cluster0.w5k8nop.mongodb.net/teesforteens?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully to DB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
