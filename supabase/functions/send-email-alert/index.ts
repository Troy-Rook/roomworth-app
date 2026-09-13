const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const text = await req.text();
    console.log("Raw body:", text);
    const body = JSON.parse(text);
    const { type, data } = body;

    let subject = "";
    let html = "";

    if (type === "deletion_request") {
      subject = "🗑️ Account Deletion Request";
      html = `<h2>Account deletion requested</h2><p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Email:</strong> ${data.email}</p>`;
    } else if (type === "new_user") {
      subject = "🏡 New Roomworth Sign Up!";
      html = `<h2>New user signed up</h2><p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Broker:</strong> ${data.broker_code}</p>`;
    } else if (type === "scan_limit") {
      subject = "⚠️ User Exceeded 200 Scans!";
      html = `<h2>User exceeded 200 scans</h2><p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Scans:</strong> ${data.scan_count}</p>`;
    } else if (type === "password_reset") {
      subject = "Reset your RoomWorth password";
      html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1B3A6B;">Reset your password</h2>
          <p>We received a request to reset your RoomWorth password. Click the button below to choose a new one:</p>
          <a href="https://roomworth.co.uk?reset=${data.token}" 
             style="display:inline-block; background: linear-gradient(135deg,#1B3A6B,#4AABBF); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #64748b; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #64748b; font-size: 13px;">— The RoomWorth Team</p>
        </div>
      `;
    }

    const toEmail = type === "password_reset" ? data.email : "troy@roomworth.co.uk";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "hello@roomworth.co.uk",
        to: toEmail,
        subject,
        html,
      }),
    });

    const resData = await res.json();
    console.log("Resend response:", JSON.stringify(resData));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});