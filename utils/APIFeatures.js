class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1A FILTER OUT COMMON QUERY PARAMS
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        // const queryObj = Object.keys(this.query).filter(key => !excludedFields.includes(key))
        //      .reduce((acc, field) => ({ ...acc, [field]: this.query[field] }), {});
        const queryObj = { ...this.queryString };
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B. ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))

        return this;
    }

    sort() {
        // &sort=price (asc) &sort=-price (desc)
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.replace(/[,]/g, ' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.replace(/[,]/g, ' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this;
    }

    paginate() {
        // page=2&limit=10 => page1 - 1-10, page2 - 11-20, page3 - 21-30
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // if (this.query.page) {
        //     const numTours = await this.query.countDocuments() // number of tour docs
        //     if (skip >= numTours) throw new Error('Page doesn\'t exist')
        // }

        return this;
    }
}

module.exports = APIFeatures