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
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "hello@roomworth.co.uk",
        to: "troy@roomworth.co.uk",
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