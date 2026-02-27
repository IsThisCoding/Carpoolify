import { PRIVATE_LOCATIONIQ_KEY } from "$env/static/private";
import type { LatLngPair } from "./types";

export async function getLatAndLong(address: string): Promise<LatLngPair> {
  let lat = 0;
  let long = 0;
  const baseUrl = "https://us1.locationiq.com/v1/search?";
  console.log(PRIVATE_LOCATIONIQ_KEY);
  const params = {
    key: PRIVATE_LOCATIONIQ_KEY,
    q: address, //query
    format: "json",
  };
  const fullUrl = baseUrl + new URLSearchParams(params);
  console.log(fullUrl);
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    lat = parseFloat(json[0].lat);
    long = parseFloat(json[0].lon);
  } catch (error: unknown) {
    console.error(
      error instanceof Error
        ? `Error: ${error.message}`
        : `Unknown error: ${error}`,
    );
  }
  return { lat: lat, lng: long };
}
