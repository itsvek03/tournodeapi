//const fs =require('fs');
const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError')



//Making alias for any top 5 cheap prices 
/**
   api/tour/top5cheap

   we are making top5cheap as router

   there are many stuff is to be used so we 
   have to used the middleware before accessing the getAlltour function


   exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price';
    next();
  };



 */




exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price';
    next();
};


//Reading file
//const redf = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/tourssample.json`));

// exports.checkId =(req,res,next,val) =>{
//    console.log(`Tour ID is ${val}`);
//    const id =req.params.id * 1;
//     if(id > redf.length){
//         return res.status(404).json({
//             status:"Fail",
//             data:{
//                 message:'Invalid ID'
//             }
//         })
//     }
// }

exports.getAlltours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    res.status(200).json({
        status: 'success',
        length: tours.length,
        data: {
            tours: tours,
        }
    });

})

exports.gettoursByid = catchAsync(async (req, res, next) => {
    const tid = await Tour.findById(req.params.id).populate('Reviews');
    if (!tid) {
        return next(new AppError('Can not find that id', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            tours: tid
        }
    })
})

exports.posttour = catchAsync(async (req, res, next) => {

    // const newId =redf[redf.length -1].id +1; 
    // const posttour = Object.assign({id :newId},req.body);
    // redf.push(posttour);

    // fs.writeFile(__dirname+"/dev-data/tourssample.json",JSON.stringify(redf),err =>{
    //     res.status(201).json({
    //         status:'Inserted Succfessfully',
    //         data:{
    //             redf:posttour
    //         }
    //     })
    // })  
    let tour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            newtour: tour
        }
    })
})

exports.patchtour = catchAsync(async (req, res, next) => {
    const tupd = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!tupd) {
        return next(new AppError('Can not find that id', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            tours: tupd
        }
    })
    next();
})

exports.delettour = catchAsync(async (req, res, next) => {
    const tid = await Tour.findByIdAndRemove(req.params.id);
    if (!tid) {
        return next(new AppError('Can not find that id', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            tours: tid
        }
    })
})

// Matching the results and grouping
/**
  So, first we have to use the aggregrate function
  

 */

exports.getTourStats = catchAsync(async (req, res) => {

    const rest = await Tour.aggregate(
        [{
            $match: {
                ratingAverage: {
                    $gte: 4.5
                }
            }
        },

        {
            $group: {
                _id: '$difficulty',
                ratingAverage: {
                    $sum: '$ratingAverage'
                },
                totalprice: {
                    $sum: '$price'
                },
                minprice: {
                    $min: '$price'
                },
                maxprice: {
                    $max: '$price'
                }

            }
        },

        {
            $sort: {
                maxprice: 1
            }
        },
        {
            $match: {
                _id: {
                    $ne: 'easy'
                }
            }
        }
        ]);

    res.status(200).json({
        status: "success",
        data: {
            rest
        }
    })
})

/**
 * Unwinding and Projecting
 * 
 * unwind is used to remove the records from the array 
 */

exports.getPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([{
        $unwind: '$startDates'
    },
    {
        $match: {
            startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }
        }
    },
    {
        $group: {
            _id: {
                $month: '$startDates'
            },
            numberofTour: {
                $sum: 1
            },
            tours: {
                $push: '$name'
            }
        }
    },
    {
        $addFields: {
            month: '$_id'
        }
    },
    {
        $project: {
            _id: 0
        }
    },
    {
        $sort: {
            numberofTour: -1
        }
    }
    ]);
    res.status(200).json({
        status: "success",
        length: plan.length,
        data: {
            plan
        }
    })
})