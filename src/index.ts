import app from "./app";

// Determina el puerto desde variables de entorno o usa 3000 por defecto
const port = Number(process.env.PORT ?? 3000);

// Inicia el servidor HTTP
app.listen(port, () => {
  console.log("=====================================");
  console.log(`🚀 MoneyWise API running at:  http://localhost:${port}`);
  console.log(`🩺 Health check available at: http://localhost:${port}/health`);
  console.log(`👤 Users endpoint available at: http://localhost:${port}/api/users`);
  console.log("=====================================");
});

// Export opcional si lo requieres para pruebas
export default app;
