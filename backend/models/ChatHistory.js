import mongoose from 'mongoose';
const documentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    documentId:{  
        type:mongoose.Schema.Types.ObjectId,
        ref:'Document',
        required:true   
    },
    messages:[{
      role:{
        type:String,
        enum:['user','assistant'],
        required:true
      },
      content:{
        type:String,
        required:true
      },
      timestamp:{
        type:Date,
        default:Date.now
      },
      relevantChunks:{
         type:[Number],
         default:[] 
      },

    }]
},{timestamps:true});

//indexing for fast queries
documentSchema.index({userId:1,documentId:1});

const ChatHistory = mongoose.model('ChatHistory',documentSchema);
export default ChatHistory;