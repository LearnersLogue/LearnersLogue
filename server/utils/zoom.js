// utils/zoom.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function getZoomAccessToken() {
  console.log(
    `accnt id: ${process.env.ZOOM_ACCOUNT_ID} , clientId: ${process.env.ZOOM_CLIENT_ID}, secret: ${process.env.ZOOM_CLIENT_SECRET}`
  );

  try {
    const res = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
            ).toString("base64"),
        },
      }
    );

    return res.data.access_token;
  } catch (error) {
    console.error(
      "❌ Failed to get Zoom access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to authenticate with Zoom API");
  }
}

async function createZoomMeeting({ topic, start_time, duration }) {
  try {
    const accessToken = await getZoomAccessToken();

    const res = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic,
        type: 2, // Scheduled meeting
        start_time,
        duration,
        timezone: "Asia/Kolkata",
        settings: {
          join_before_host: false,
          waiting_room: true,
          approval_type: 0,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to create Zoom meeting:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create Zoom meeting");
  }
}

export { createZoomMeeting };
