import { createServer } from "node:http";
import { access } from "node:fs/promises";
import fs from "node:fs";

const server = createServer(async (req, res) => {
  const ok = await access("./public", fs.R_OK).then(() => true, () => false);
  res.writeHeader(ok ? 200 : 503, { "content-type": "text/plain" });
  res.end(ok ? "ok" : "public folder missing");
});

server.listen(Number(process.env.PORT ?? 3000));
