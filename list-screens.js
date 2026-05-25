import { stitch } from "@google/stitch-sdk";

const STITCH_API_KEY = process.env.STITCH_API_KEY;

const projectId = "6799890692542069979";

async function main() {
  const project = stitch.project(projectId);
  const screens = await project.screens();
  console.log("Screens in project:", screens.length);
  for (const s of screens) {
    console.log(`- ID: ${s.id}, name: ${s.name || 'unnamed'}`);
  }
}
main();
