const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Iiwibm9tYnJlIjoiVGVzdCIsImNvcnJlbyI6Im90cm9AZXhhbXBsZS5jb20iLCJzY29wZXMiOlsiaW5ncmVzb3M6bGVlciIsImluZ3Jlc29zOmVzY3JpYmlyIiwiZWdyZXNvczpsZWVyIiwiZWdyZXNvczplc2NyaWJpciIsIm1ldGFzOmxlZXIiLCJtZXRhczplc2NyaWJpciIsImludmVyc2lvbmVzOmxlZXIiLCJpbnZlcnNpb25lczplc2NyaWJpciIsImNhdGFsb2dvczpsZWVyIiwiZGFzaGJvYXJkOmxlZXIiXSwiaWF0IjoxNzY0MjY0NDU3LCJleHAiOjE3NjQzNTA4NTcsImF1ZCI6Im1vbmV5d2lzZS11c2VycyIsImlzcyI6Im1vbmV5d2lzZS1hcGkifQ.jsa5q-wRxey5jJsMSpDcAKVVECoLiWhRoAVAylRpL8Y";
const userId = 5;

(async () => {
  const res = await fetch(`https://moneywise-integracion-production.up.railway.app/api/users/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "api-key-moneywise-7af3b1b6-2c6f-4f3d-9b2b-7b8c9d1e5f42",
      Authorization: `Bearer ${token}`,
      "x-mw-user": String(userId),
      "x-mw-scopes": "usuarios:leer"
    },
  });
  console.log("Status:", res.status);
  console.log(JSON.stringify(await res.json(), null, 2));
})();
