const fs = require("fs");
const Tour = require("./../model/tourModel");
const User = require("./../model/userModel")
const Review = require("./../model/reviewModel")
require("./../connection/connection");

// Reading the document
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));
const user = JSON.parse(fs.readFileSync(`${__dirname}/user.json`, "utf-8"));

// Importing data into db
const importdata = async (req, res) => {
  try {
    await Tour.create(tour);
    await Review.create(review);
    await User.create(user, { validateBeforeSave: false });
    console.log("Data loaded successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Deleting the data from db

const deletedata = async (req, res) => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data deleted successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Working with the command propmt to import and delete

// For delete the file  node dev-data/import-dev-data.js --delete
//output for these
// [
//  0   'C:\\Program Files\\nodejs\\node.exe',
//   1  'E:\\NodeProjectTwo\\dev-data\\import-dev-data.js',
//    2 '--delete'
// ]
// For importing the file node dev-data/import-dev-data.js --import

if (process.argv[2] === "--import") {
  importdata();
} else if (process.argv[2] === "--delete") {
  deletedata();
}

//console.log(process.argv)
