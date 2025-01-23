import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";

const PORT = process.env.PORT || 3001;

const serverFile = async (res, filePath, contentType) => {
  try {
    const html = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(html);
  } catch (err) {
    res.writeHead(400, { "Content-Type": "content/plain" });
    res.end("404 page not found");
    console.log(err);
  }
};

const server = createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
        return serverFile(res, path.join("URL_Shortener", "public", "index.html"), "text/html");
    }
    if(req.url === "/style.css"){
        return serverFile(res, path.join("URL_Shortener", "public", "style.css"), "text/css");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
