import { Router } from "express";

const orderRoutes: Router = Router();

import { OrderController } from "../../../controllers/orders/orders.controller";
import { userAuthMiddleware } from "../../../middlewares/user-auth.middleware";
const orderController = new OrderController();

orderRoutes.post(
    "/order/create",
    userAuthMiddleware,
    orderController.createOrder
);

// get order by customer_id
orderRoutes.get(
    "/order/view/customer/:customer_id",
    userAuthMiddleware,
    orderController.getOrderByCustomerId
);

//get order
orderRoutes.get("/order/view", orderController.getOrder);

//use coupon
orderRoutes.get("/coupon/:coupon_code", orderController.getValidCouponByCode);

export default orderRoutes;
