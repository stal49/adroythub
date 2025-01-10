import mongoose, {Document,Model,Schema} from "mongoose";


export interface IOrder extends Document{
    courseId: string;
    userId?:string;
    payment_info: object;
    isFree: boolean;
}

const orderSchema = new Schema<IOrder>({
    courseId: {
     type: String,
     required: true
    },
    userId:{
        type: String,
        required: true
    },
    payment_info:{
        type: Object,
        required: false
    },
    isFree: {
      type: Boolean,
      required: true,
      default: false, // Default is false, indicating a paid course unless specified
    },
},{timestamps: true});

const OrderModel: Model<IOrder> = mongoose.model('Order',orderSchema);

export default OrderModel;