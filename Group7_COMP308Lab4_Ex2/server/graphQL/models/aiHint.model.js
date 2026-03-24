import mongoose from "mongoose";

const aiHintSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, default: "anonymous" },
    level: { type: Number, required: true, min: 1 },
    input: { type: String, default: "" },
    hint: { type: String, required: true },
    retrievedHints: { type: [String], default: [] },
  },
  { timestamps: true }
);

aiHintSchema.virtual("hintId").get(function () {
  return this._id.toString();
});

aiHintSchema.set("toJSON", { virtuals: true });
aiHintSchema.set("toObject", { virtuals: true });

export default mongoose.model("AIHint", aiHintSchema);
