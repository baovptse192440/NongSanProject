import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "AU Nông Sản"}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Xác thực email của bạn",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0a923c;">Xác thực email của bạn</h2>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại AU Nông Sản. Vui lòng click vào link dưới đây để xác thực email của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0a923c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực email</a>
        </div>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p>Link này sẽ hết hạn sau 24 giờ.</p>
        <p>Trân trọng,<br>Đội ngũ AU Nông Sản</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "AU Nông Sản"}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0a923c;">Đặt lại mật khẩu</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng click vào link dưới đây để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0a923c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br>Đội ngũ AU Nông Sản</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendOrderNotificationToAdmin(
  orderData: {
    orderNumber: string;
    userFullName: string;
    userEmail: string;
    userPhone?: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZipCode: string;
    shippingCountry: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      variantName?: string;
    }>;
    subtotal: number;
    shippingFee: number;
    total: number;
    notes?: string;
  },
  adminEmails: string[] = []
) {
  // Get admin emails from parameter or environment
  const emailsToSend = adminEmails.length > 0 
    ? adminEmails 
    : [process.env.ADMIN_EMAIL || process.env.SMTP_USER || ""].filter(Boolean);
  
  if (emailsToSend.length === 0) {
    console.error("Admin email not configured");
    return { success: false, error: "Admin email not configured" };
  }

  const itemsHtml = orderData.items.map((item, index) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; text-align: center;">${index + 1}</td>
      <td style="padding: 10px;">${item.productName}${item.variantName ? ` (${item.variantName})` : ""}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "AU Nông Sản"}" <${process.env.SMTP_USER}>`,
    to: emailsToSend.join(", "),
    subject: `New Order Received - ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #0a923c; margin-top: 0;">New Order Received</h2>
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            <strong>Order Number:</strong> ${orderData.orderNumber}
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${orderData.userFullName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${orderData.userEmail}</p>
            ${orderData.userPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${orderData.userPhone}</p>` : ""}
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${orderData.shippingAddress}</p>
            <p style="margin: 5px 0;">${orderData.shippingCity}, ${orderData.shippingState} ${orderData.shippingZipCode}</p>
            <p style="margin: 5px 0;">${orderData.shippingCountry}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white;">
              <thead>
                <tr style="background-color: #0a923c; color: white;">
                  <th style="padding: 10px; text-align: center;">#</th>
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Unit Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Subtotal:</span>
              <span style="font-weight: bold;">$${orderData.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Shipping Fee:</span>
              <span style="font-weight: bold;">$${orderData.shippingFee.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #0a923c; padding-top: 10px; margin-top: 10px;">
              <span style="font-size: 18px; font-weight: bold; color: #0a923c;">Total:</span>
              <span style="font-size: 18px; font-weight: bold; color: #0a923c;">$${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          ${orderData.notes ? `
            <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
              <h4 style="margin-top: 0; color: #856404;">Notes:</h4>
              <p style="margin: 0; color: #856404;">${orderData.notes}</p>
            </div>
          ` : ""}

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Please process this order as soon as possible.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending order notification email:", error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationToUser(orderData: {
  orderId?: string;
  orderNumber: string;
  userEmail: string;
  userFullName: string;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    variantName?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
}) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: "Order Confirmed",
      message: "Your order has been confirmed and is being processed.",
    },
    processing: {
      title: "Order Processing",
      message: "Your order is currently being processed.",
    },
    shipped: {
      title: "Order Shipped",
      message: "Your order has been shipped and is on its way to you.",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been delivered successfully.",
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled. If you have any questions, please contact us.",
    },
  };

  const statusInfo = statusMessages[orderData.status] || {
    title: "Order Status Updated",
    message: `Your order status has been updated to ${orderData.status}.`,
  };

  const itemsHtml = orderData.items.map((item, index) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; text-align: center;">${index + 1}</td>
      <td style="padding: 10px;">${item.productName}${item.variantName ? ` (${item.variantName})` : ""}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "AU Nông Sản"}" <${process.env.SMTP_USER}>`,
    to: orderData.userEmail,
    subject: `${statusInfo.title} - Order ${orderData.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #0a923c; margin-top: 0;">${statusInfo.title}</h2>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Dear ${orderData.userFullName},
          </p>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            ${statusInfo.message}
          </p>
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            <strong>Order Number:</strong> ${orderData.orderNumber}
          </p>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white;">
              <thead>
                <tr style="background-color: #0a923c; color: white;">
                  <th style="padding: 10px; text-align: center;">#</th>
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Unit Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Subtotal:</span>
              <span style="font-weight: bold;">$${orderData.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold;">Shipping Fee:</span>
              <span style="font-weight: bold;">$${orderData.shippingFee.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #0a923c; padding-top: 10px; margin-top: 10px;">
              <span style="font-size: 18px; font-weight: bold; color: #0a923c;">Total:</span>
              <span style="font-size: 18px; font-weight: bold; color: #0a923c;">$${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${orderData.shippingAddress}</p>
            <p style="margin: 5px 0;">${orderData.shippingCity}, ${orderData.shippingState} ${orderData.shippingZipCode}</p>
            <p style="margin: 5px 0;">${orderData.shippingCountry}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/profile/orders/${orderData.orderId || orderData.orderNumber}" 
               style="background-color: #0a923c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">
            Thank you for your purchase!
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Trân trọng,<br>Đội ngũ AU Nông Sản
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
}
