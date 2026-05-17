import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    visitorId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

likeSchema.index({ blogId: 1, visitorId: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
