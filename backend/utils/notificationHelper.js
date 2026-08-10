import Notification from "../models/Notification.js";

/**
 * Create a notification for a user, vendor, or admin.
 * Non-throwing — notification failures don't break the main request.
 */
export const createNotification = async ({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  link = "",
  refId = null,
  refModel = null,
}) => {
  try {
    await Notification.create({
      recipientId,
      recipientRole,
      type,
      title,
      message,
      link,
      refId,
      refModel,
    });
  } catch (err) {
    console.error("[Notification] Failed to create:", err.message);
  }
};
