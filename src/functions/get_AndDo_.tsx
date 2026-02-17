import client from "../client";

async function get_AndDo_(route) {
  try {
    await client({
      method: "get",
      url: route,
    });

  } catch (error) {
    console.log(error);
  }
}

export default get_AndDo_;
