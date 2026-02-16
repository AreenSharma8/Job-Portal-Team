const Notification = require('../models/Notification');
const AppError = require('../../../../shared/utils/AppError');

// Get user notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId: req.user.id });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark as read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({ status: 'success', data: { notification } });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Create notification (internal service call)
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message, data, link } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      link,
    });

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', notification);
    }

    res.status(201).json({ status: 'success', data: { notification } });
  } catch (error) {
    next(error);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ status: 'success', message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// Unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    res.status(200).json({ status: 'success', data: { count } });
  } catch (error) {
    next(error);
  }
};
