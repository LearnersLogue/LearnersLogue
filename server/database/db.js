import mongoose from "mongoose";

async function connectMongoDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGODBKEY);
    console.log(`mongodb connected successfull: ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default connectMongoDB;
