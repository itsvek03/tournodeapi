// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('../model/tourModel')
const ReviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'tours',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'users',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Create the avg rating
ReviewSchema.statics.calculateAverage = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    console.log(stats);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingAverage: stats[0].avgRating
    });
}
ReviewSchema.post('save', function () {
    this.constructor.calculateAverage(this.tour)
})

ReviewSchema.pre(/^find/, function (next) {
    this.populate(
        {
            path: 'user',
            select: 'name photo'
        }
    )
    next();
})

const ReviewModel = mongoose.model('reviews', ReviewSchema);

module.exports = ReviewModel;