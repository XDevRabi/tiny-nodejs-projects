import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

import express from "express";
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
const staticFilesPath = path.join(import.meta.dirname, "public");
app.use(express.static(staticFilesPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DATA_FILE = path.join(import.meta.dirname, "data", "links.json");
const loadLinks = async () => {
  try {
    // read data of the file and return it on json format
    const data = await fs.readFile(DATA_FILE);
    // console.log(data);
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
    // If the file doesn't exist, create it
    if (err.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw err;
  }
};

const saveLinks = async (links) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(links));
  } catch (err) {
    console.log(err);
  }
};

app.get("/", async (req, res) => {
  try {
    const indexFile = await fs.readFile(
      path.join(import.meta.dirname, "views", "index.html")
    );
    const links = await loadLinks();

    const html = indexFile.toString().replace(
      "{{shortened_urls}}",
      Object.entries(links)
        .map(
          ([shortUrl, longUrl]) =>
            `
            <div class="url-item">
                <div class="url-details">
                    <p class="short-url">${req.hostname}/${shortUrl}</p>
                    <p class="long-url">${longUrl}</p>
                </div>
                <a href="${shortUrl}" target="_blank" rel="noopener noreferrer" class="external-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-external-link">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" x2="21" y1="14" y2="3"/>
                    </svg>
                </a>
            </div>
          `
        )
        .join("")
    );

    res.send(html);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// API to get the shorten url list
app.get("/get-short-url", async (req, res) => {
  const links = await loadLinks();
  //   console.log(links);
  res.status(200).send(JSON.stringify(links));
});

// To handle the shorten url request redirection to the actual url
app.get("/:shortUrl", async (req, res) => {
  const links = await loadLinks();
  const shortUrl = req.params.shortUrl;

  if (links[shortUrl]) {
    res.redirect(links[shortUrl]); // Redirect to the long url
  } else {
    res.status(404).send("Short URL not found");
  }
});

// To handle the shorten url request
app.post("/shorten", async (req, res) => {
  const links = await loadLinks();
  console.log("req.body", req.body);
  const longUrl = req.body.longUrl;
  const shortUrl = req.body.shortUrl || crypto.randomBytes(4).toString("hex");

  if (!longUrl) {
    return res.status(400).send("Long URL is required");
  }

  if (links[shortUrl]) {
    return res.status(400).send("Short URL already exists");
  }

  links[shortUrl] = longUrl;
  await saveLinks(links);

  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
