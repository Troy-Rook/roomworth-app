import "@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "troy@roomworth.co.uk";
const FROM_EMAIL = "hello@roomworth.co.uk";

async function sendEmail(subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html,
    }),
  });
  return res.json();
}

export default {
  fetch: async (req: Request) => {
    try {
      const body = await req.json();
      const { type, data } = body;

      if (type === "new_user") {
        await sendEmail(
          "🏡 New Roomworth Sign Up!",
          `
            <h2>New user signed up to Roomworth</h2>
            <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Broker Code:</strong> ${data.broker_code}</p>
            <p><strong>Signed up:</strong> ${new Date().toLocaleString("en-GB")}</p>
          `
        );
      }

      if (type === "scan_limit") {
        await sendEmail(
          "⚠️ User Exceeded 200 Scans!",
          `
            <h2>A user has exceeded 200 scans</h2>
            <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Total scans:</strong> ${data.scan_count}</p>
          `
        );
      }

      if (type === "deletion_request") {
        await sendEmail(
          "🗑️ Account Deletion Request",
          `
            <h2>A user has requested account deletion</h2>
            <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Requested:</strong> ${new Date().toLocaleString("en-GB")}</p>
            <p>Please action this request in line with your GDPR obligations.</p>
          `
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};