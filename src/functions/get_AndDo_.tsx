import client from "../client";

async function get_AndDo_(route) {
  try {
    const response = await client({
      method: "get",
      url: route,
    });
    return response
  } catch (error) {
    console.log(error);
  }
}

export default get_AndDo_;
