import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { url } from "inspector";
import crypto from "crypto";
import { json } from "stream/consumers";

const PORT = process.env.PORT || 3001;

// Some Funtions
const serverFile = async (res, filePath, contentType) => {
  try {
    const html = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(html);
  } catch (err) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("404 page not found");
    console.log(err);
  }
};

const DATA_FILE = path.join("URL_Shortener", "data", "links.json");
const loadLinks = async () => {
  try {
    // read data of the file and return it on json format
    const data = await readFile(DATA_FILE);
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
    // If the file doesn't exist, create it
    if (err.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw err;
  }
};

const saveLinks = async (links) => {
  try {
    await writeFile(DATA_FILE, JSON.stringify(links));
  } catch (err) {
    console.log(err);
  }
};

// =======

const server = createServer(async (req, res) => {
  if (req.method === "GET") {
    // It will serve the frontend files
    if (req.url === "/") {
      return serverFile(
        res,
        path.join("URL_Shortener", "public", "index.html"),
        "text/html"
      );
    } else if (req.url === "/style.css") {
      return serverFile(
        res,
        path.join("URL_Shortener", "public", "style.css"),
        "text/css"
      );
    } else {
      // Handling the request for the shorten url click
      const links = await loadLinks();
      const shortUrl = req.url.split("/").pop(); // /3f06576e => 3f06576e

      if (links[shortUrl]) {
        res.writeHead(301, { Location: links[shortUrl] }); // Redirect to the long url
        return res.end();
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Short URL not found");
    }

    // API to get the shorten url
    if (req.url === "/get-short-url") {
      const links = await loadLinks();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(links));
    }
  }

  // it will process the shorten url request
  if (req.method === "POST") {
    if (req.url === "/shorten") {
      const links = await loadLinks();
      let body = "";

      // It will collect the form data
      req.on("data", (chunk) => {
        body += chunk;
      });

      // after the form data is collected
      req.on("end", async () => {
        const { longUrl, shortUrl } = JSON.parse(body);

        if (!url) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("URL is required");
        }

        const finalShortUrl = shortUrl || crypto.randomBytes(4).toString("hex");

        // Check if the short URL of the request url already exists
        if (links[finalShortUrl]) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Short URL already exists");
        }

        links[finalShortUrl] = longUrl;
        await saveLinks(links);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, shortUrl: finalShortUrl }));
      });
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
