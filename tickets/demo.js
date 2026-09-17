const token = "<pega aquí un token real obtenido de POST /api/v1/auth/acceso>";
const userId = 5;

(async () => {
  const res = await fetch(`https://moneywise-integracion-production.up.railway.app/api/users/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "<tu API_KEY, ver Railway → Variables, nunca la comitees>",
      Authorization: `Bearer ${token}`,
      "x-mw-user": String(userId),
      "x-mw-scopes": "usuarios:leer"
    },
  });
  console.log("Status:", res.status);
  console.log(JSON.stringify(await res.json(), null, 2));
})();
