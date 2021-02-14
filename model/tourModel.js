// Importing the file
const mongoose = require("mongoose");
const slugify = require("slugify");

//Making a Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have more or equal then 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A difficult must be present"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: String,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, "Price is important"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "An image Cover is required"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      }
    ]
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual properties are the fields that we defined in our schema but will not be saved in databases
// We cannot put virtual fields in the query
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtual populate of review
tourSchema.virtual('Reviews', {
  ref: 'reviews',
  foreignField: 'tour',
  localField: '_id'
})

// Documnet Middleware runs before save and create
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// Query middleware is used for anything if we want query to execute before final execution
tourSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: {
      $ne: true,
    },
  });
  next();
});

//Show the referencing guides
tourSchema.pre(/^find/, function (next) {
  this.populate(
    {
      path: 'guides',
      select: '-__v'
    }
  ).populate({
    path: 'Reviews'
  })
  next();
})

// Aggregation Middleware is used for aggregrate query
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  next();
});

//Making a MOdel
const Tour = mongoose.model("tours", tourSchema);

//Exporting
module.exports = Tour;
