class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {

        // Basic Filtering
        // const queryObj ={...req.query};
        // let excludeObj =['page','sort','limit','field'];
        // excludeObj.forEach(e1 => delete queryObj[e1]); 
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach(el => delete queryObj[el]);
  
      // 1B) Advanced filtering
        // Query an coondition
        //{difficulty:'easy',duration:{$gte:5}}


        /*how to write in a postman
            ?duration[gte]=5&difficulty=easy

        */
    //    let querystr =JSON.stringify(queryObj);
    //    querystr =querystr.replace(/\b(gte|gt|lte|lt)\b/g,match =>`$${match}`);
    //    console.log(JSON.parse(querystr));
    //    const query = Tour.find(JSON.parse(querystr));
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  


  // Sorting based on price and Rating average 

        // Our request query is /sort=price,Averagerating    --gives us ascending order
        // Our request query is /sort=price,-Averagerating    --gives us descending order
       
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy);
        //     query =query.sort(sortBy);
        // }
        // else{
        //     query= query.sort('-createdAt');
        // }
  
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-price');
      }
  
      return this;
    }
  



    // Limit fields
    /* It means that which field we have to show

    api/tour/fields=name,duration

    if(req.query.field){
      const limquery = req.query.field.split(',').join(' ');
      query =query.select(limquery);
    }
    */
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  

    //paginate

    /*
    It means that how how many data we have to show on the 
    basis of that we have to paginate the records
    
    api/tour/page=pageno&limit=3
    
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page -1) *limit

    query =query.skip(skip).limit(limit);

    // If pages does not exist then we have to throw error

    if(req.query.page){
      const numTours = await Tour.createDocument();
      if(skip >numTours) throw new Error('This page does not exist)
    }

    */
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }
  module.exports = APIFeatures;