import app from "./app";
import { logger } from "./config/logger";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  const baseUrl = `http://localhost:${port}`;
  logger.info({ baseUrl, host, port }, "MoneyWise API running");
  logger.info({ endpoint: `${baseUrl}/health` }, "Health check disponible");
  logger.info({ endpoint: `${baseUrl}/api/users` }, "Users endpoint disponible");
  logger.info({ endpoint: `${baseUrl}/api/v1/egresos` }, "Egresos endpoints disponibles");
});
