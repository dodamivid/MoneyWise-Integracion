import app from './app';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`MoneyWise API running at http://localhost:${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
  console.log(`Users endpoint available at http://localhost:${port}/api/users`);
});