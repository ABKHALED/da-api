const Order = require("../modules/Order");
const Product = require("../modules/Product");
const User = require("../modules/User");
const { v4 } = require("uuid");

const getInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Please try again" });
    const user = await User.findById(id).select(["-password"]).exec();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  // try {
  //   const { userId } = req.body;
  //   if (!userId) return res.status(400).json({ message: "Please try again" });
  //   const user = await User.findById(userId).select(["-password"]).exec();
  //   res.status(200).json(user);
  // } catch (err) {
  //   res.status(500).json({ message: err.message });
  // }
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, number } = req.body;
    if (!userId || !productId || !number)
      return res.status(400).json({ message: "Please try again" });
    const user = await User.findById(userId).exec();
    const product = await Product.findById(productId).exec();
    if (!product) {
      return res
        .status(400)
        .json({ message: `There is no product with the ID: ${productId}` });
    }
    const item = {
      itemId: v4(),
      product: product,
      number: number,
    };
    if (item) {
      user.cart = [...user.cart, item];
    }
    const newItem = await User.findByIdAndUpdate(
      userId,
      { cart: user.cart },
      { new: true }
    );

    res.status(200).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId)
      return res.status(400).json({ message: "Please try again" });
    const user = await User.findById(userId).exec();
    const newArray = user.cart.filter((ele) => ele.itemId !== itemId);
    if (!newArray)
      return res.status(400).json({ message: `there is no item to remove` });
    user.cart = newArray;

    const newItem = await User.findByIdAndUpdate(
      userId,
      { cart: user.cart },
      { new: true }
    );

    res.status(200).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const addToFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    console.log(userId, productId);
    if (!userId || !productId)
      return res.status(400).json({ message: "Please try again" });
    const user = await User.findById(userId).exec();
    const product = await Product.findById(productId).exec();
    if (!product) {
      return res
        .status(400)
        .json({ message: `There is no product with the ID: ${productId}` });
    }
    const item = {
      itemId: v4(),
      product: product,
    };
    if (item) {
      user.favorite = [...user.favorite, item];
    }
    const newItem = await User.findByIdAndUpdate(
      userId,
      { favorite: user.favorite },
      { new: true }
    );

    res.status(200).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromFavorite = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId)
      return res.status(400).json({ message: "Please try again" });
    const user = await User.findById(userId).exec();
    const newArray = user.favorite.filter((ele) => ele.itemId !== itemId);
    if (!newArray)
      return res.status(400).json({ message: `there is no item to remove` });
    user.favorite = newArray;

    const newItem = await User.findByIdAndUpdate(
      userId,
      { favorite: user.favorite },
      { new: true }
    );

    res.status(200).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addOrder = async (req, res) => {
  try {
    const { userId, array } = req.body;
    if (!userId || !array)
      return res.status(400).json({ message: "Plese try agian" });
    const newOrder = {
      userId,
      products: array,
    };
    const orders = await Order.create(newOrder);

    if (orders) {
      //created
      const user = await User.findById(userId).exec();

      user.orders = [...user.orders, orders];

      const newItem = await User.findByIdAndUpdate(
        userId,
        { orders: user.orders },
        { new: true }
      );
      res.status(201).json({ message: `Thank you for ordering` });
    } else {
      res.status(400).json({ message: "Invalid Order data received" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeOreder = async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    if (!userId || !orderId)
      return res.status(400).json({ message: "Plese try agian" });
    const order = await Order.findById(orderId).exec();
    if (!order) {
      return res
        .status(400)
        .json({ message: `There is no order with the ID: ${orderId}` });
    }
    const result = await order.deleteOne();
    const user = await User.findById(userId).exec();
    const newArray = user.orders.filter(
      (ele) => ele._id.toString() !== orderId
    );
    user.orders = newArray;

    const newItem = await User.findByIdAndUpdate(
      userId,
      { orders: user.orders },
      { new: true }
    );
    res.status(200).json({ message: `order with the ID: ${orderId} deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const test = async (order, userId, orderId) => {
  const result = await order.deleteOne();
  const user = await User.findById(userId).exec();
  const newArray = user.orders.filter((ele) => ele._id.toString() !== orderId);
  user.orders = newArray;

  const newItem = await User.findByIdAndUpdate(
    userId,
    { orders: user.orders },
    { new: true }
  );
};

const orderUpDate = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    const order = await Order.findById(orderId).exec();
    if (!order) return res.status(400).json({ message: "Order not found" });
    order.state = true;
    const newOrder = await order.save();
    if (newOrder) {
      const user = await User.findById(userId).exec();
      const theOne = user.orders.find((ele) => ele._id.toString() === orderId);
      theOne.state = true;
      const arr = user.orders.filter((ele) => ele._id.toString() !== orderId);
      user.orders = [...arr, theOne];
      const newItem = await User.findByIdAndUpdate(
        userId,
        { orders: user.orders },
        { new: true }
      );
      if (newItem) {
        setTimeout(() => {
          test(order, userId, orderId);
        }, 604800000);
      }
      res
        .status(201)
        .json({ message: `the order with the ID: ${orderId} updated` });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  addToCart,
  removeFromCart,
  addToFavorite,
  removeFromFavorite,
  addOrder,
  removeOreder,
  orderUpDate,
  getInfo,
};
