let BASE_URL;

if (window.location.hostname === "localhost") {
  BASE_URL = "http://localhost/React/LogiTrack/backend";
} else {
  BASE_URL = "https://lt.mhrsifat.xyz/backend";
}

export { BASE_URL };