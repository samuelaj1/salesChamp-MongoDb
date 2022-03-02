const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    username: String,
    comment: String,
    rating: Number
});

const PublicationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    cover_image: String,
    pdf_file: String,
    file: String,
    description: String,
    publisher: {
        type: Schema.Types.ObjectId,
        ref: 'Publisher',
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
        
    },
    price: Number,
    author: String,
    edition: {
        type: Number,
        min: 1
    },
    content_type: {
        type: String,
        enum: ["newspapers", "books", "magazines"],
        required: true
    },
    frequency: {
        type: String,
        enum: ["one-time", "daily", "biweekly", "weekly", "fortnightly", "monthly", "quarterly", "annually"]
    },
    downloads: {
        type: Number,
        min: 0,
        default: 0
    },
    sales: {
        type: Number,
        min: 0,
        default: 0
    },
    views: {
        type: Number,
        min: 0,
        default: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Reader'
    }],
    tags: [String],
    genre: String,
    language: String,
    country: String,
    pages: Number,
    isbn: String,
    issue: String,
    comments: [CommentSchema],
    release_date: {
        type: Date
    },
    time_available: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Publication', PublicationSchema);