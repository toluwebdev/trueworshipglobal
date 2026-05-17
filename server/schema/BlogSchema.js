import mongoose from "mongoose";
const blogSchema = new mongoose.Schema({
    imageUrl:{
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
   
    content: {
        type: String,
        required: true
    },
    isPublished:{
        type: Boolean,
        default: false
    },
    publishedAt:{
        type: Date,
        default: null
    }
},{timestamps: true});
const Blog = mongoose.model("Blog", blogSchema);
export default Blog;