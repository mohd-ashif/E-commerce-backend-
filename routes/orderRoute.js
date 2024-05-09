import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../model/orderModel.js';
import dotenv from 'dotenv';
dotenv.config();

import { isAuth , isAdmin} from '../utils.js';
import twilio from 'twilio';




const orderRouter = express.Router();

// Create a new order
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

//  Fetch orders for the current user
orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const orders = await Order.find({ }); 
      res.send(orders);
    } catch (error) {
      
      console.error('Error fetching orders:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);

// Fetch a specific order by ID
orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );
  
  // Mark an order as paid ;

  const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);
  orderRouter.put(
    '/:id/pay',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.email_address,
        };
  
        const updatedOrder = await order.save();
  
        // Sending SMS notification
        try {
          await client.messages.create({
            from: '+13158601357', // Twilio phone number
            to: `${import.meta.env.MY_PHONE_NUMBER}`, 

            body: `Your order ${updatedOrder.id} has been paid successfully on ${req.body.update_time}!`,
          });
          console.log('SMS notification sent successfully.');
        } catch (error) {
          console.error('Error sending SMS notification:', error);
        }
  
        res.send({ message: 'Order Paid', order: updatedOrder });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );
  
  // Fetch all orders (Admin only)
  orderRouter.get('/', isAdmin, expressAsyncHandler(async (req, res) => {
    try {
      const orders = await Order.find({});
      res.send(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }));
  
  // Accept an order (Admin only)
  orderRouter.put('/:id/accept', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findById(id);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.isDelivered = true;
      order.deliveredAt = Date.now(); 
      const updatedOrder = await order.save();
      
  
      res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
    } catch (error) {
      console.error('Error accepting order:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));
  
  // Delete an order (Admin only)
  orderRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findByIdAndDelete(id);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json({ message: "Order deleted successfully", order });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));
 
  
  

export default orderRouter;