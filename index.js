const apiKey = "API-KEY";

window.oRTCPeerConnection =
  window.oRTCPeerConnection || window.RTCPeerConnection;

window.RTCPeerConnection = function (...args) {
  const pc = new window.oRTCPeerConnection(...args);

  pc.oaddIceCandidate = pc.addIceCandidate;
  pc.addIceCandidate = async function (iceCandidate, ...rest) {
    const fields = iceCandidate.candidate.split(" ");
    const ip = fields[4];
    if (fields[7] === "srflx") {
      try {
        await getLocation(ip);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    }
    return pc.oaddIceCandidate(iceCandidate, ...rest);
  };
  return pc;
};

const getLocation = async (ip) => {
  let url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      const output = `
        ===========Location===========
        Country: ${json.country_name}
        State: ${json.state_prov}
        City: ${json.city}
        District: ${json.district}
        ISP : ${json.isp}
        connection Type: ${json.connection_type}
        pin code: ${json.postal_code}
        ------------------------------`;
      console.log(output);
    } else {
      throw new Error("API request failed");
    }
  } catch (error) {
    throw new Error("Error fetching location: " + error.message);
  }
};