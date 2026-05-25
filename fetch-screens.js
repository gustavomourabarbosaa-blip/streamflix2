import { stitch } from "@google/stitch-sdk";
import fs from "fs";
import path from "path";

const STITCH_API_KEY = process.env.STITCH_API_KEY;

const projectId = "6799890692542069979";
const screens = [
  { name: "design_system", id: "asset-stub-assets-aaedbea52b6a4d4789f650e2813c4132-1779509676497" },
  { name: "movie_details", id: "6c6889b8df934a648674a63c4a185e4c" },
  { name: "catalog", id: "a2a689e9bfb440d6889301b5fa97e85f" },
  { name: "home", id: "e8b50a7830294084a402c54bc2d5a8e0" }
];

async function main() {
  const project = stitch.project(projectId);
  console.log("Connected to project:", projectId);
  
  for (const scr of screens) {
    console.log(`Fetching screen: ${scr.name} (${scr.id})`);
    try {
      const screen = await project.getScreen(scr.id);
      
      const htmlUrl = await screen.getHtml();
      console.log(`HTML URL for ${scr.name}:`, htmlUrl);
      if (htmlUrl) {
        const res = await fetch(htmlUrl);
        const htmlText = await res.text();
        fs.writeFileSync(`${scr.name}.html`, htmlText);
        console.log(`Saved ${scr.name}.html`);
      }
      
      const imageUrl = await screen.getImage();
      console.log(`Image URL for ${scr.name}:`, imageUrl);
      if (imageUrl) {
        const res = await fetch(imageUrl);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(`${scr.name}.png`, Buffer.from(buffer));
        console.log(`Saved ${scr.name}.png`);
      }
    } catch (e) {
      console.error(`Error fetching screen ${scr.name}:`, e);
    }
  }
}

main();
